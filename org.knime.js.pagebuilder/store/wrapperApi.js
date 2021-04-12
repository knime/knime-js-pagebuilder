/* global rpc */
export const namespaced = true;

/**
 * This store is a standing layer for Wizard Execution functionality in the AP. Together with the
 * main.js APWrapper serve as the communication layer between the "new" PageBuilder (@since 4.2) and
 * the KAP API.
 *
 * Added in @version 4.4
 */

let pollingTimeout;
const POLLING_INTERVAL = 2000; // ms

// TODO: Remove fire-bug console

export const actions = {

    /* RE-EXECUTION ACTIONS */

    async triggerReExecution({ dispatch }, { nodeId }) {
        consola.debug('WrapperAPI store: trigger re-execution');
        /* CLIENT (View/Widget) VALIDATION */
        let validPage = await dispatch('pagebuilder/getValidity', null, { root: true })
            .then((res, err) =>  {
                let isValid = false;
                let viewValidities = Object.values(res);
                if (viewValidities || viewValidities.length > 0) {
                    isValid = viewValidities.every(isValid => isValid === true);
                }
                return isValid;
            })
            .catch(e => {
                consola.debug('Cannot re-execute page as errors exist.');
                return false;
            });

        if (!validPage) {
            // in AP/Wrapper, views handle validation styles as there is no global message.
            consola.error('Client side validation failed.');
            return;
        }

        /* VALUE AND PAGE RETRIEVAL */
        let viewValues = await dispatch('pagebuilder/getViewValues', null, { root: true }).catch(e => false);
        if (!viewValues) {
            consola.error('Retrieving viewValues failed.');
            return;
        }

        dispatch('handleReExecutionAction', {
            caller: 'triggerReExecution',
            rpcConfig: {
                jsonrpc: '2.0',
                id: 0,
                method: 'reexecutePage',
                params: [
                    nodeId,
                    Object.keys(viewValues).reduce((obj, nId) => {
                        obj[nId] = JSON.stringify(viewValues[nId]);
                        return obj;
                    }, {})
                ]
            }
        });
    },

    pollReExecution({ dispatch }) {
        consola.debug('WrapperAPI store: Polling re-execution');
        dispatch('handleReExecutionAction', {
            caller: 'pollReExecution',
            rpcConfig: {
                jsonrpc: '2.0',
                id: 0,
                method: 'getPage',
                params: []
            }
        });
    },

    /* UTILITY ACTIONS */

    async handleReExecutionAction({ dispatch }, { caller, rpcConfig }) {
        let { result, error } = await dispatch('dispatchRPC', rpcConfig);

        if (!result || error) {
            dispatch('handleError', { caller, error });
            return;
        }
        let shouldPoll = await dispatch('updateReExecutedPage', result);
        if (shouldPoll) {
            clearTimeout(pollingTimeout);
            pollingTimeout = setTimeout(() => {
                dispatch('pollReExecution');
            }, POLLING_INTERVAL);
        }
    },

    handleError({ dispatch }, { caller, error }) {
        consola.error(`WrapperAPI store ${caller} exception`, error);
        // dispatch('pagebuilder/alert/showAlert', {
        //     type: 'error',
        // TODO: finish
        // });
    },

    updateReExecutedPage({ dispatch }, { page, resetNodes } = {}) {
        let shouldPoll = false;
        try {
            if (page) {
                page = JSON.parse(page);
                console.log('WrapperAPI store: update page', page);
                let nodeIds = Object.keys(page.webNodes);
                dispatch('pagebuilder/setNodesReExecuting', [], { root: true });
                dispatch('pagebuilder/updatePage', { page, nodeIds }, { root: true });
            } else if (resetNodes?.length) {
                console.log('WrapperAPI store: set re-executed nodes', resetNodes);
                dispatch('pagebuilder/setNodesReExecuting', resetNodes, { root: true });
                shouldPoll = true;
            }
        } catch (error) {
            return dispatch('handleError', { caller: 'updateReExecutedPage', error });
        }
        return shouldPoll;
    },

    dispatchRPC(_, rpcConfig) {
        let result, error;
        if (typeof rpc === 'function') {
            try {
                ({ result, error } = JSON.parse(rpc(JSON.stringify(rpcConfig))));
            } catch (e) {
                consola.error('WrapperAPI store: RPC exception ', e);
                error = e;
            }
        } else {
            error = 'Global RPC not available';
        }
        return { result, error };
    }
};
