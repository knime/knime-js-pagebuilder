import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { KnimeService } from 'knime-ui-extension-service';
jest.mock('knime-ui-extension-service');

import * as pagebuilderStoreConfig from '~/store/pagebuilder';
import * as alertStoreConfig from '~/store/alert';
import * as serviceStoreConfig from '~/store/service';
import * as apiStoreConfig from '~/store/wrapperApi';

import UIExtension from '@/components/views/UIExtension';
import UIExtComponent from '@/components/views/UIExtComponent';
import UIExtIFrame from '@/components/views/UIExtIFrame';
import AlertLocal from '@/components/ui/AlertLocal';
import WarningLocal from '@/components/ui/WarningLocal';

import { iFrameExtensionConfig, componentExtensionConfig } from '../../../assets/views/extensionConfig';


describe('UIExtension.vue', () => {
    const createStore = ({
        callServiceMock = jest.fn(),
        pushNotificationMock = jest.fn(),
        registerServiceMock,
        deregisterServiceMock
    }) => {
        let storeConfig = {
            modules: {
                pagebuilder: pagebuilderStoreConfig,
                'pagebuilder/alert': alertStoreConfig,
                'pagebuilder/service': {
                    ...serviceStoreConfig,
                    actions: {
                        ...serviceStoreConfig.actions,
                        pushNotification: pushNotificationMock
                    }
                },
                api: {
                    ...apiStoreConfig,
                    actions: {
                        callService: callServiceMock
                    },
                    namespaced: true
                }
            }
        };
        if (registerServiceMock) {
            storeConfig.modules['pagebuilder/service'].actions.registerService = registerServiceMock;
        }
        if (deregisterServiceMock) {
            storeConfig.modules['pagebuilder/service'].actions.deregisterService = deregisterServiceMock;
        }
        return new Vuex.Store(storeConfig);
    };

    const getMockIFrameProps = () => ({ extensionConfig: { ...iFrameExtensionConfig } });

    const getMockComponentProps = () => ({ extensionConfig: { ...componentExtensionConfig } });

    let localVue, context;

    beforeAll(() => {
        localVue = createLocalVue();
        localVue.use(Vuex);

        context = {
            store: createStore({
                callServiceMock: jest.fn(),
                registerServiceMock: jest.fn()
            }),
            localVue
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders ui extensions as Vue components', () => {
        let wrapper = shallowMount(UIExtension, {
            ...context,
            propsData: getMockComponentProps()
        });
        expect(wrapper.find(UIExtComponent).exists()).toBeTruthy();
        expect(wrapper.find(UIExtIFrame).exists()).toBeFalsy();
    });

    it('renders ui extensions as iframes', () => {
        let wrapper = shallowMount(UIExtension, {
            ...context,
            propsData: getMockIFrameProps()
        });
        expect(wrapper.find(UIExtIFrame).exists()).toBeTruthy();
        expect(wrapper.find(UIExtComponent).exists()).toBeFalsy();
    });

    it('increments key when node info updates', () => {
        let wrapper = shallowMount(UIExtension, {
            ...context,
            propsData: getMockIFrameProps()
        });
        const startingKey = wrapper.vm.configKey;
        let { extensionConfig } = getMockIFrameProps();
        extensionConfig.resourceInfo.url = 'http://localhost:8080/your_widget.html';
        wrapper.setProps({ extensionConfig });
        expect(wrapper.vm.configKey).toBeGreaterThan(startingKey);
    });

    it('creates and registers a KnimeService instance during mount', () => {
        let registerServiceMock = jest.fn();
        let propsData = getMockComponentProps();
        let wrapper = shallowMount(UIExtension, {
            localVue,
            store: createStore({ registerServiceMock }),
            propsData
        });
        expect(registerServiceMock).toHaveBeenCalledWith(expect.anything(), {
            service: expect.any(KnimeService)
        }, expect.undefined);
        expect(KnimeService).toBeCalledWith(
            propsData.extensionConfig,
            wrapper.vm.callService,
            wrapper.vm.pushNotification
        );
    });

    it('pushes service notifications via the pagebuilder store', async () => {
        let pushNotificationMock = jest.fn();
        let propsData = getMockComponentProps();
        let wrapper = shallowMount(UIExtension, {
            localVue,
            store: createStore({ pushNotificationMock }),
            propsData
        });
        let notification = { agent: '007' };
        await wrapper.vm.pushNotification(notification);
        expect(pushNotificationMock).toHaveBeenCalledWith(expect.anything(), notification, expect.undefined);
    });

    it('dispatches service calls to the api store', async () => {
        let callServiceMock = jest.fn();
        let propsData = getMockComponentProps();
        let wrapper = shallowMount(UIExtension, {
            localVue,
            store: createStore({ callServiceMock }),
            propsData
        });
        let requestParams = { agent: '007' };
        let nodeService = 'NodeService.callNodeDataService';
        let serviceRequest = 'data';
        await wrapper.vm.callService(nodeService, serviceRequest, requestParams);
        expect(callServiceMock).toHaveBeenCalledWith(expect.anything(), {
            extensionConfig: componentExtensionConfig,
            nodeService,
            serviceRequest,
            requestParams
        }, expect.undefined);
    });

    describe('handling messages', () => {
        const mockAlert = { message: 'Shaken not stirred.' };

        it('displays alerts via push notification', async () => {
            let pushNotificationMock = jest.fn();
            let propsData = getMockComponentProps();
            let wrapper = shallowMount(UIExtension, {
                localVue,
                store: createStore({ pushNotificationMock }),
                propsData
            });
            let handleAlertSpy = jest.spyOn(wrapper.vm, 'handleAlert');
            let notification = { type: 'alert', alert: mockAlert };
            await wrapper.vm.pushNotification(notification);
            expect(pushNotificationMock).not.toHaveBeenCalled();
            expect(handleAlertSpy).toHaveBeenCalledWith(mockAlert);
        });

        it('sets alerts locally', () => {
            let wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: getMockComponentProps()
            });
            let showAlertSpy = jest.spyOn(wrapper.vm.$store._actions['pagebuilder/alert/showAlert'], '0');
            wrapper.vm.handleAlert(mockAlert);
            expect(showAlertSpy).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toStrictEqual(mockAlert);
        });

        it('sets alerts via pagebuilder store', () => {
            let wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: getMockComponentProps()
            });
            wrapper.vm.$store.state.pagebuilder.isDialogLayout = true;
            let showAlertSpy = jest.spyOn(wrapper.vm.$store._actions['pagebuilder/alert/showAlert'], '0');
            wrapper.vm.handleAlert(mockAlert);
            expect(showAlertSpy).toHaveBeenCalledWith({
                ...mockAlert, callback: wrapper.vm.closeAlert
            });
            expect(wrapper.vm.alert).toBeFalsy();
        });

        it('removes local alerts', () => {
            let wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: getMockComponentProps()
            });
            wrapper.setData({ alert: mockAlert });
            wrapper.vm.closeAlert(true);
            expect(wrapper.vm.alert).toBeFalsy();
        });
    });

    describe('displaying messages', () => {
        it('displays error alerts', () => {
            let mockErrorAlert = { message: 'Shaken not stirred.', type: 'error' };
            let wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: getMockComponentProps()
            });
            let showAlertSpy = jest.spyOn(wrapper.vm, 'showAlert');
            wrapper.setData({ alert: mockErrorAlert });
            let alertLocal = wrapper.find(AlertLocal);
            expect(alertLocal.exists()).toBeTruthy();
            alertLocal.vm.$emit('showAlert');
            expect(showAlertSpy).toHaveBeenCalledWith(mockErrorAlert);
        });

        it('displays warning alerts', () => {
            let mockWarningAlert = { message: 'Bond, James Bond.', type: 'warn' };
            let wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: getMockComponentProps()
            });
            let showAlertSpy = jest.spyOn(wrapper.vm, 'showAlert');
            wrapper.setData({ alert: mockWarningAlert });
            let warningButton = wrapper.find(WarningLocal);
            expect(warningButton.exists()).toBeTruthy();
            warningButton.vm.$emit('click');
            expect(showAlertSpy).toHaveBeenCalledWith(mockWarningAlert);
        });

        it('clears alerts', () => {
            let mockWarningAlert = { message: 'M' };
            let wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: getMockComponentProps()
            });
            wrapper.setData({ alert: mockWarningAlert });
            expect(wrapper.vm.alert).toStrictEqual(mockWarningAlert);
            wrapper.vm.closeAlert();
            // expect nothing
            expect(wrapper.vm.alert).toStrictEqual(mockWarningAlert);
            wrapper.vm.closeAlert(true);
            expect(wrapper.vm.alert).toBe(null);
        });
    });

    it('deregisters a KnimeService instance during destroy', () => {
        let deregisterServiceMock = jest.fn();
        let propsData = getMockComponentProps();
        let wrapper = shallowMount(UIExtension, {
            localVue,
            store: createStore({ deregisterServiceMock }),
            propsData
        });
        expect(deregisterServiceMock).not.toHaveBeenCalled();
        wrapper.destroy();
        expect(deregisterServiceMock).toHaveBeenCalledWith(expect.anything(), {
            service: expect.any(KnimeService)
        }, expect.undefined);
    });
});
