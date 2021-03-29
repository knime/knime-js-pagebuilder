export const namespaced = true;

/**
 * This store is a standing layer for Wizard Execution functionality in the AP. Together with the
 * main.js APWrapper serve as the communication layer between the "new" PageBuilder (@since 4.2) and
 * the KAP API.
 *
 * Added in @version 4.4
 */

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
            .catch(e => false);

        if (!validPage) {
            // in AP/Wrapper, views handle validation styles as there is no global message.
            consola.error('Client side validation failed.');
            return {};
        }

        /* VALUE AND PAGE RETRIEVAL */
        let viewValues = await dispatch('pagebuilder/getViewValues', null, { root: true }).catch(e => false);
        if (viewValues) {
            // return "monitor" object
            return window.KnimePageLoader.reexecutePage(nodeId, viewValues);
        }
        consola.error('Retrieving viewValues failed.');
        return {};
    }
};
