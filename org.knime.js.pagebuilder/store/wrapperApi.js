/* global jsonrpc */
// eslint-disable-next-line no-unused-vars
import { KnimeUtils, KnimeTypes } from 'knime-ui-extension-service';
const { createJsonRpcRequest } = KnimeUtils;

export const namespaced = true;

let pollingTimeout; // global target for assigning setTimeout ids
const POLLING_INTERVAL = 2000; // ms between polling actions

/**
 * This store is a standing layer for Wizard Execution functionality in the AP. Together with the main.js APWrapper
 * this serves as the communication layer between the "new" PageBuilder (added in @version 4.2) and the KAP API.
 *
 * @author ben.laney
 * @since 4.4.0
 */
export const actions = {

    /* UI-EXTENSION ACTIONS */

    /**
     * Initiates a node service call to the AP via RPC which subsequently targets an extension service implementation
     * of the node identified by the provided extension config.
     *
     * @param {Object} context - Vuex context.
     * @param {Object} param - action config.
     * @param {Object} param.extensionConfig - the UI extension config.
     * @param {KnimeTypes.NodeService} param.nodeService - the node service to call.
     * @param {KnimeTypes.ServiceRequest} param.serviceRequest - the service request.
     * @param {any} param.requestParams - the request parameters.
     * @returns {Promise<Object>} - the results of the service call. The resolved results will optionally contain
     *      the @property {result} (if the service was successful) or the @property {error} (if the service failed).
     */
    callService({ dispatch }, { extensionConfig, nodeService, serviceRequest, requestParams }) {
        let rpcParams = [extensionConfig.projectId, extensionConfig.workflowId, extensionConfig.nodeId,
            extensionConfig.extensionType, serviceRequest, requestParams];
        if (nodeService.includes('updateDataPointSelection')) {
            // Match the method signature to the selection service expected format (no extension type).
            // eslint-disable-next-line no-magic-numbers
            rpcParams.splice(3, 1);
        }
        return dispatch('singleRPC', { rpcConfig: createJsonRpcRequest(nodeService, rpcParams) });
    },

    /* RE-EXECUTION ACTIONS */

    /**
     * Calls the NodeService via an RPC to change the NodeState of the given Node.
     *
     * @param {Object} context - Vuex context.
     * @param {Object} param - action config.
     * @param {Object} param.extensionConfig - the UI extension config.
     * @param {KnimeTypes.NodeService} param.action - the action to change the node state.
     * @returns {undefined}
     */
    changeNodeStates({ dispatch }, { extensionConfig, action }) {
        const rpcParams = [
            extensionConfig.projectId, extensionConfig.workflowId, [extensionConfig.nodeId], action
        ];
        dispatch('singleRPC', {
            rpcConfig: createJsonRpcRequest('NodeService.changeNodeStates', rpcParams)
        });
    },

    /**
     * Triggers a partial re-execution of the composite view. This consists of the following steps: validation, value
     * retrieval and page update or polling initialization.
     *
     * @async
     * @param {Object} context - Vuex context.
     * @param {Object} param - action config.
     * @param {String} param.nodeId - id of the node which triggered re-execution.
     * @returns {undefined}
     */
    async triggerReExecution({ dispatch }, { nodeId }) {
        consola.debug('WrapperAPI store: trigger re-execution');
        /* CLIENT (View/Widget) VALIDATION */
        let validPage = await dispatch('pagebuilder/getValidity', null, { root: true })
            .then((res, err) => {
                let isValid = false;
                let viewValidities = Object.values(res);
                if (viewValidities || viewValidities.length > 0) {
                    isValid = viewValidities.every(isValid => isValid === true);
                }
                return isValid;
            })
            .catch(e => false);

        if (!validPage) {
            dispatch('handleError', {
                caller: 'triggerReExecution',
                error: 'Client-side validation failed. Please check the page for errors.'
            });
            return;
        }

        /* VALUE AND PAGE RETRIEVAL */
        let viewValues = await dispatch('pagebuilder/getViewValues', null, { root: true }).catch(e => false);
        if (!viewValues) {
            dispatch('handleError', {
                caller: 'triggerReExecution',
                error: 'Retrieving page values failed. Please check the page for errors.'
            });
            return;
        }
        dispatch('pollRPC', {
            pollAction: 'updatePage',
            callback: 'setPage',
            config: {
                nodeId,
                rpcConfig: createJsonRpcRequest('ReexecutionService.reexecutePage', [
                    nodeId,
                    Object.keys(viewValues).reduce((obj, nId) => {
                        obj[nId] = JSON.stringify(viewValues[nId]);
                        return obj;
                    }, {})
                ])
            }
        });
    },

    /* WIZARD ACTIONS */

    /**
     * Initiates an update of the current page via RPC polling. Action handles updating the page which is returned or
     * updating the nodes which are executing.
     *
     * @async
     * @param {Object} context - Vuex context.
     * @param {Object} param - action config.
     * @param {String} param.nodeId - id of the node who's RPC server should be queried.
     * @returns {undefined}
     */
    updatePage({ dispatch }, { nodeId }) {
        consola.debug('WrapperAPI store: updatePage');
        dispatch('pollRPC', {
            pollAction: 'updatePage',
            callback: 'setPage',
            config: { nodeId, rpcConfig: createJsonRpcRequest('ReexecutionService.getPage') }
        });
    },

    /**
     * Given a page configuration object or an array of nodeIds, this action dispatches pagebuilder actions to
     * update the pagebuilder store state either with the new page or the executing nodes.
     *
     * @param {Object} context - Vuex context.
     * @param {Object} param - action config.
     * @param {Object} [param.page] - the optional page for the current component returned by the RPC server if
     *      execution has finished.
     * @param {Array} [param.resetNodes] - the optional array of all nodeIds which were reset for re-execution.
     * @param {Array} param.reexecutedNodes - a subset of the resetNodes nodeIds which are no longer executing.
     * @returns {Object} pollConfig - configuration for additional polling.
     * @returns {boolean} pollConfig.shouldPoll - false if the page was successfully updated else true if polling
     *      /updates should be continued.
     * @returns {number} [pollConfig.pollInterval] - optional integer value for next polling interval (default is
     *      undefined).
     */
    setPage({ dispatch }, { page, resetNodes = [], reexecutedNodes: reExecutedNodes = [] } = {}) {
        consola.debug(
            'WrapperAPI store: setPage (page, resetNodes, reexecutedNodes)', page, resetNodes, reExecutedNodes
        );
        try {
            if (page) {
                let nodeIds = reExecutedNodes?.length ? reExecutedNodes : Object.keys(page.webNodes);
                dispatch('pagebuilder/setNodesReExecuting', [], { root: true });
                dispatch('pagebuilder/updatePage', { page, nodeIds }, { root: true });
                return { shouldPoll: false };
            } else if (resetNodes?.length) {
                if (resetNodes?.every(nodeId => reExecutedNodes?.includes(nodeId))) {
                    // If all nodes have executed, but page isn't ready, don't wait or update- just fetch page.
                    return { shouldPoll: true, pollInterval: 1 };
                }
                dispatch(
                    'pagebuilder/setNodesReExecuting',
                    resetNodes.filter(id => !reExecutedNodes.includes(id)),
                    { root: true }
                );
                return { shouldPoll: true }
            } else {
                throw new Error('No updates were provided for the page');
            }
        } catch (error) {
            dispatch('handleError', { caller: 'setPage', error });
            return { shouldPoll: false };
        }
    },

    /* RPC ACTIONS */

    /**
     * Calls a single RPC call via the global RPC function (jsonrpc). If no global function exists, return value will have the
     * error property set.
     *
     * @param {Object} _ - Vuex context (unused).
     * @param {Object} param - action config.
     * @param {Object} param.rpcConfig - the RPC configuration for the global RPC invocation.
     *          E.g.: {
     *              jsonrpc: '2.0', (always 2.0)
     *              id: 0, (can be unique)
     *              method: 'ReexecutionService.getPage', (name of RPC service + method)
     *              params: [...] (RPC params, else empty array)
     *          }
     * @returns {Object} - the results of the RPC call; either with the result property (if the call was successful) or
     *      the error property (if an exception occurred).
     */
    singleRPC(_, { rpcConfig }) {
        let result, error;
        if (typeof jsonrpc === 'function') {
            try {
                consola.debug(`WrapperAPI store: dispatch RPC: ${rpcConfig}`);
                ({ result, error } = JSON.parse(jsonrpc(JSON.stringify(rpcConfig))));
            } catch (err) {
                error = err;
            }
        } else {
            error = 'This functionality is not supported with the current browser. Please ensure the correct ' +
                'browser is selected by going to ‘Preferences → KNIME → JavaScript Views’ and selecting the ' +
                'option ‘Chromium Embedded Framework (CEF) Browser’.';
        }
        return { result, error };
    },

    /**
     * RPC utility action to help with reusable RPC polling. The calling action should either pass it's own method
     * name via the pollAction parameter or, if initializing, should ensure whatever action is passed recursively
     * calls this (pollRPC) action when invoked.
     *
     * Cessation of polling occurs when the callback (provided via parameterized string action name) consumes the
     * results of the initial RPC call (configured via config parameter) and returns a falsy value. If the results of
     * the initial RPC call where not sufficient to stop polling, a truthy value should be returned from the callback
     * action.
     *
     * @async
     * @param {Object} context - Vuex context (unused).
     * @param {Object} param - action config.
     * @param {String} param.pollAction - the string name of the action which should be triggered if polling
     *      continues.
     * @param {String} param.callback - the string name of the callback action which should act as a consumer for the
     *      results of the initial RPC call. This callback action is expected to return a truthy value if the polling
     *      should continue or a falsy value if the polling should stop at the current iteration.
     * @param {Object} param.config - the configuration for calling the initial RPC call.
     * @param {String} param.nodeId - id of the node who's RPC server should be used for polling queries.
     * @param {Object} param.config.rpcConfig - the RPC configuration for the global RPC invocation.
     *          E.g.: {
     *              jsonrpc: '2.0', (always 2.0)
     *              id: 0, (can be unique)
     *              method: 'ReexecutionService.getPage', (name of RPC service + method)
     *              params: [...] (RPC params, else empty array)
     *          }
     * @returns {undefined}
     */
    async pollRPC({ dispatch }, { pollAction, callback, config }) {
        let { result, error } = await dispatch('singleRPC', config);
        
        if (!result || error) {
            dispatch('handleError', {
                caller: config?.rpcConfig?.method || pollAction,
                error
            });
            return;
        }
        let { shouldPoll, pollInterval = POLLING_INTERVAL } = await dispatch(callback, result) || {};
        if (shouldPoll) {
            consola.debug('WrapperAPI store: polling action', pollAction);
            clearTimeout(pollingTimeout);
            pollingTimeout = setTimeout(() => {
                dispatch(pollAction, config);
            }, pollInterval);
        }
    },

    /* UTILITY ACTIONS */

    /**
     * A helper action to display a global error alert via the pagebuilder global alert + store action.
     *
     * @param {Object} context - Vuex context (unused).
     * @param {Object} param - action config.
     * @param {String} param.caller - an identifying string for where the error originated to be show in the alert and
     *      in the console.
     * @param {Object} param.error - information regarding the error which took place. Usually an Error object or a
     *      custom message.
     * @returns {undefined}
     */
    handleError({ dispatch }, { caller, error }) {
        consola.error(`WrapperAPI store ${caller} exception`, error);
        dispatch('pagebuilder/alert/showAlert', {
            nodeInfo: {
                nodeName: caller
            },
            message: error
        }, { root: true });
    }
};

export const getters = {
    // In local environments (AP), resource locations are defined by the 'baseUrl' and the relative resource path.
    uiExtResourceLocation: () => ({ resourceInfo } = {}) => {
        if (resourceInfo?.debugUrl) {
            return resourceInfo?.debugUrl;
        }
        return resourceInfo?.baseUrl + resourceInfo?.path;
    }
};
