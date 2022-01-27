import consola from 'consola';

export const namespaced = true;

export const state = () => ({
    services: {}
});

export const mutations = {

    /**
     * Adds the provided service to the service map.
     *
     * @param {*} state - Vuex state.
     * @param {Object} serviceWrapper - the service to register, wrapped in an frozen object to prevent reactivity.
     * @returns {undefined}
     */
    registerService(state, serviceWrapper) {
        state.services[serviceWrapper.service.serviceId] = serviceWrapper;
    },

    /**
     * Removes the provided service from the service map.
     *
     * @param {*} state - Vuex state.
     * @param {Object} serviceWrapper - the service to deregister, wrapped in an frozen object to prevent reactivity.
     * @returns {undefined}
     */
    deregisterService(state, serviceWrapper) {
        delete state.services[serviceWrapper.service.serviceId];
    }
};

export const actions = {

    /**
     * Registers a service in the global service store so it can participate in globally coordinated functionality.
     *
     * @param {Object} context - Vuex context.
     * @param {Object} param - action config.
     * @param {Object} param.serviceWrapper - the service to register, wrapped in an frozen object to prevent reactivity.
     * @returns {undefined}
     */
    registerService({ commit }, { serviceWrapper }) {
        consola.trace('PageBuilder: registerService via action: ', serviceWrapper);
        commit('registerService', serviceWrapper);
    },

    /**
     * Deregisters a service in the global service store (e.g. when the component is destroyed) to clean up
     * application memory.
     *
     * @param {Object} context - Vuex context.
     * @param {Object} param - action config.
     * @param {Object} param.serviceWrapper - the service to deregister, wrapped in an frozen object to prevent reactivity.
     * @returns {undefined}
     */
    deregisterService({ commit }, { serviceWrapper }) {
        consola.trace('PageBuilder: deregisterService via action: ', serviceWrapper);
        commit('deregisterService', serviceWrapper);
    },

    /**
     * Dispatches a notification to all globally registered services via their defined callbacks. Optionally,
     * a service id for the calling service can be provided to exclude that service from receiving the notification.
     *
     * @param {Object} context - Vuex context.
     * @param {Object} params - action config.
     * @param {Notification} param.event - the event to broadcast.
     * @param {string} [param.callerId] - optional service id of the calling service which should be skipped.
     * @returns {Promise<any>[]} a collection of Promise resolutions for registered notification callbacks.
     */
    pushNotification({ state }, { event, callerId }) {
        return Promise.all(Object.values(state.services).filter(
            serviceWrapper => serviceWrapper.service.serviceId !== callerId
        ).map((service) => service.onServiceNotification(event)));
    }
};
