import consola from 'consola';
import getUIExtUUID from '~/src/util/getUIExtUUID';

export const namespaced = true;

export const state = () => ({
    services: {}
});

export const mutations = {

    /**
     * Adds the provided service to the service map.
     *
     * @param {*} state - Vuex state.
     * @param {KnimeService} service - the service to register.
     * @returns {undefined}
     */
    registerService(state, service) {
        state.services[getUIExtUUID(service)] = service;
    },

    /**
     * Removes the provided service from the service map.
     *
     * @param {*} state - Vuex state.
     * @param {KnimeService} service - the service to deregister.
     * @returns {undefined}
     */
    deregisterService(state, service) {
        delete state.services[getUIExtUUID(service)];
    }
};

export const actions = {

    /**
     * Registers a service in the global service store so it can participate in globally coordinated functionality.
     *
     * @param {Object} context - Vuex context.
     * @param {Object} param - action config.
     * @param {KnimeService} param.service - the service to register.
     * @returns {undefined}
     */
    registerService({ commit }, { service }) {
        consola.trace('PageBuilder: registerService via action: ', service);
        commit('registerService', service);
    },

    /**
     * Deregisters a service in the global service store (e.g. when the component is destroyed) to clean up
     * application memory.
     *
     * @param {Object} context - Vuex context.
     * @param {Object} param - action config.
     * @param {KnimeService} param.service - the service to deregister.
     * @returns {undefined}
     */
    deregisterService({ commit }, { service }) {
        consola.trace('PageBuilder: deregisterService via action: ', service);
        commit('deregisterService', service);
    },

    /**
     * Dispatches a notification to all globally registered services via their defined callbacks.
     *
     * @param {Object} context - Vuex context.
     * @param {Object} params - action config.
     * @param {Notification} param.event - the event to broadcast.
     * @returns {Promise<any>[]} a collection of Promise resolutions for registered notification callbacks.
     */
    pushNotification({ state }, { event }) {
        return Promise.all(Object.values(state.services).map(
            (service) => service.onJsonRpcNotification(event)
        ));
    }
};
