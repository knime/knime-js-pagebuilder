import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { KnimeService } from '@knime/ui-extension-service';
jest.mock('@knime/ui-extension-service');

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
import { viewConfig } from '../../../assets/views/viewConfig';


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

    const getMockIFrameProps = () => ({ extensionConfig: { ...iFrameExtensionConfig }, viewConfig: { ...viewConfig } });

    const getMockComponentProps = () => ({ extensionConfig: { ...componentExtensionConfig }, viewConfig: { ...viewConfig } });

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

    it('increments key on UIExtIFrame when node info updates', () => {
        let wrapper = shallowMount(UIExtension, {
            ...context,
            propsData: getMockIFrameProps()
        });
        const startingLocalKey = wrapper.vm.configKey;
        const startingIFrameKey = wrapper.find(UIExtIFrame).vm.$vnode.key;
        expect(startingLocalKey).toBe(0);
        expect(startingIFrameKey).toBe(0);
        let { extensionConfig } = getMockIFrameProps();
        extensionConfig.resourceInfo.url = 'http://localhost:8080/your_iframe_widget.html';
        wrapper.setProps({ extensionConfig });
        expect(wrapper.vm.configKey).toBeGreaterThan(startingLocalKey);
        expect(wrapper.find(UIExtIFrame).vm.$vnode.key).toBeGreaterThan(startingIFrameKey);
    });

    it('increments key on UIExtComponent when node info updates', () => {
        let wrapper = shallowMount(UIExtension, {
            ...context,
            propsData: getMockComponentProps()
        });
        const startingLocalKey = wrapper.vm.configKey;
        const startingComponentKey = wrapper.find(UIExtComponent).vm.$vnode.key;
        expect(startingLocalKey).toBe(0);
        expect(startingComponentKey).toBe(0);
        let { extensionConfig } = getMockComponentProps();
        extensionConfig.resourceInfo.url = 'http://localhost:8080/your_vue_widget.html';
        wrapper.setProps({ extensionConfig });
        expect(wrapper.vm.configKey).toBeGreaterThan(startingLocalKey);
        expect(wrapper.find(UIExtComponent).vm.$vnode.key).toBeGreaterThan(startingComponentKey);
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

        it('displays alerts via extensionConfig', () => {
            let handleAlertMock = jest.fn();
            const message = 'test error';
            let propsData = {
                ...getMockComponentProps(),
                extensionConfig: {
                    ...getMockComponentProps().extensionConfig,
                    nodeInfo: {
                        nodeWarnMessage: null,
                        nodeErrorMessage: message
                    }
                }
            };
            shallowMount(UIExtension, {
                ...context,
                localVue,
                propsData,
                methods: { handleAlert: handleAlertMock }
            });
            const expectedAlert = { message, type: 'error', subtitle: '', nodeId: propsData.extensionConfig.nodeId };
            
            expect(handleAlertMock).toHaveBeenCalledWith(expectedAlert);
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

    describe('styling', () => {
        it('respects resize classes', () => {
            viewConfig.resizeMethod = 'aspectRatio1by1';
            let wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: getMockIFrameProps()
            });
            expect(wrapper.find('div').attributes('class')).toEqual('aspectRatio1by1');
            viewConfig.resizeMethod = 'aspectRatio16by9';
            wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: getMockIFrameProps()
            });
            expect(wrapper.find('div').attributes('class')).toEqual('aspectRatio16by9');
        });

        it('renders with classes and styles', () => {
            let mockProps = getMockIFrameProps();
            let wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: {
                    ...getMockIFrameProps(),
                    viewConfig: {
                        resizeMethod: 'aspectRatio1by1',
                        additionalClasses: ['class1', 'class2'],
                        additionalStyles: ['color: red;', 'border: 1px solid green;']
                    }
                }
            });
            expect(wrapper.attributes('class')).toEqual('aspectRatio1by1 class1 class2');
            expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green;');
        });

        it('adds classes for min/max height & width', () => {
            let wrapper = shallowMount(UIExtension, {
                ...context,
                propsData: {
                    ...getMockIFrameProps(),
                    viewConfig: {
                        resizeMethod: 'viewLowestElement',
                        additionalClasses: ['class1', 'class2'],
                        additionalStyles: ['color: red;', 'border: 1px solid green;'],
                        minHeight: 100,
                        maxHeight: 200,
                        minWidth: 100,
                        maxWidth: 200
                    }
                }
            });
            expect(wrapper.attributes('class')).toBe('fill-container class1 class2');
            expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green; max-height: 200px;' +
                ' max-width: 200px; min-height: 100px; min-width: 100px;');
        });
    });
});
