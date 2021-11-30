import consola from 'consola';
import { KnimeService } from 'knime-ui-extension-service';
import { Notification } from 'knime-ui-extension-service/dist/index-af6571f7';
import { Context } from 'types/vuex';
import getUIExtUUID from '../src/util/getUIExtUUID';

export const namespaced = true;

interface ServiceState {
    services: {
        [serviceId: string]: KnimeService
    }
}

type ServiceContext = Context<ServiceState>;

export const state : (() => ServiceState) = () => ({
    services: {}
});

export const mutations = {

    /**
     * Adds the provided service to the service map.
     *
     * @param {ServiceState} state - Vuex state.
     * @param {KnimeService} service - the service to register.
     * @returns {undefined}
     */
    registerService(state: ServiceState, service: KnimeService) {
        state.services[getUIExtUUID(service)] = service;
    }
};

export const actions = {

    /**
     * Registers a service in the global service store so it can participate in globally coordinated functionality.
     *
     * @param {ServiceContext} context - Vuex context.
     * @param {Object} param - action config.
     * @param {KnimeService} param.service - the service to register.
     * @returns {undefined}
     */
    registerService(context: ServiceContext, param: { service: KnimeService }) {
        consola.trace('PageBuilder: registerService via action: ', param.service);
        context.commit('registerService', param.service);
    },

    /**
     * Dispatches an SSE notification to all globally registered services via their defined callbacks.
     *
     * @param {ServiceContext} context - Vuex context.
     * @param {Object} params - action config.
     * @param {Notification} param.event - the event to broadcast.
     * @returns {Promise<any>[]} a collection of Promise resolutions for registered notification callbacks.
     */
    pushNotification(context: ServiceContext, params: { event: Notification }) {
        return Promise.all(Object.values(context.state.services).map(
            (service: KnimeService) => service.onJsonrpcNotification(params.event)
        ));
    }
};
