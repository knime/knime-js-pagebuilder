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
    async triggerReExecution({ commit, dispatch }, { nodeId }) {
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
            return {};
        }

        /* VALUE AND PAGE RETRIEVAL */
        let viewValues = await dispatch('pagebuilder/getViewValues', null, { root: true }).catch(e => false);
        if (!viewValues) {
            consola.error('Retrieving viewValues failed.');
            return {};
        }

        let rpcConfig = {
            jsonrpc: '2.0',
            method: 'reexecutePage',
            params: [
                nodeId,
                Object.keys(viewValues).reduce((obj, nId) => {
                    obj[nId] = JSON.stringify(viewValues[nId]);
                    return obj;
                }, {})
            ]
        };
        let response;
        if (typeof rpc === 'function') {
            response = rpc(JSON.stringify(rpcConfig));
        }

        console.log('Re-execute page response: ', response);
        consola.debug('Initializing re-execution polling');
        pollingTimeout = setTimeout(() => {
            dispatch('pollReexecution');
        }, POLLING_INTERVAL);
    },

    pollReexecution({ dispatch }) {
        consola.trace('Polling rpc re-execution');
        let rpcConfig = {
            jsonrpc: '2.0',
            method: 'getPage',
            params: []
        };
        let response;
        if (typeof rpc === 'function') {
            response = rpc(JSON.stringify(rpcConfig));
        }
        console.log('Polling response: ', response);

        if (response.error) {
            // TODO cancel
        }
        if (response.page) {
            dispatch('updatePage', response);
        } else {
            clearTimeout(pollingTimeout);
            pollingTimeout = setTimeout(() => {
                dispatch('pollReexecution');
            }, POLLING_INTERVAL);
        }
    },

    updatePage({ dispatch }) {
        // TODO
        // consola.log('handleCompositeUpdate', response);
        // if (response.jsonResponse?.['@class']?.includes('JSONWebNodePage')) {
        //     let page = {
        //         wizardPageContent: response.jsonResponse
        //     };
        //     let nodeIds = Object.keys(page.wizardPageContent.webNodes);
        //     pageBuilder.app.$store.dispatch('pagebuilder/setNodesReExecuting', [], { root: true });
        //     return pageBuilder.app.$store.dispatch('pagebuilder/updatePage', { page, nodeIds }, { root: true });
        // }
        // if (response.jsonResponse === null && response.resetNodes?.length) {
        //     return pageBuilder.app.$store.dispatch(
        //         'pagebuilder/setNodesReExecuting',
        //         response.resetNodes,
        //         { root: true }
        //     );
        // }
    }
};
