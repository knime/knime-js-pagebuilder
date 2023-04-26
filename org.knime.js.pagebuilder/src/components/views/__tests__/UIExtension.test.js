import { expect, describe, beforeAll, afterEach, it, vi } from 'vitest';
import { createStore } from 'vuex';
import { shallowMount } from '@vue/test-utils';
import { KnimeService } from '@knime/ui-extension-service';
vi.mock('@knime/ui-extension-service');
import * as pagebuilderStoreConfig from '@/store/pagebuilder';
import * as alertStoreConfig from '@/store/alert';
import * as serviceStoreConfig from '@/store/service';
import * as apiStoreConfig from '@/store/wrapperApi';
import UIExtension from '@/components/views/UIExtension.vue';
import UIExtComponent from '@/components/views/UIExtComponent.vue';
import UIExtIFrame from '@/components/views/UIExtIFrame.vue';
import AlertLocal from '@/components/ui/AlertLocal.vue';
import WarningLocal from '@/components/ui/WarningLocal.vue';
import { iFrameExtensionConfig, componentExtensionConfig } from '@@/test/assets/views/extensionConfig';
import { viewConfig } from '@@/test/assets/views/viewConfig';


describe('UIExtension.vue', () => {
    const createPagebuilderStore = ({
        callServiceMock = vi.fn(),
        pushEventMock = vi.fn(),
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
                        pushEvent: pushEventMock
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
        return createStore(storeConfig);
    };

    const getMockIFrameProps = () => (
        {
            extensionConfig: { ...iFrameExtensionConfig },
            viewConfig: { ...viewConfig }
        }
    );

    const getMockComponentProps = () => (
        {
            extensionConfig: { ...componentExtensionConfig },
            viewConfig: { ...viewConfig }
        }
    );

    let context;

    beforeAll(() => {
        context = {
            global: {
                mocks: {
                    $store: createPagebuilderStore({
                        callServiceMock: vi.fn(),
                        registerServiceMock: vi.fn()
                    })
                }
            }
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders ui extensions as Vue components', () => {
        let wrapper = shallowMount(UIExtension, {
            ...context,
            props: getMockComponentProps()
        });
        expect(wrapper.findComponent(UIExtComponent).exists()).toBeTruthy();
        expect(wrapper.findComponent(UIExtIFrame).exists()).toBeFalsy();
    });

    it('renders ui extensions as iframes', () => {
        let wrapper = shallowMount(UIExtension, {
            ...context,
            props: getMockIFrameProps()
        });
        expect(wrapper.findComponent(UIExtIFrame).exists()).toBeTruthy();
        expect(wrapper.findComponent(UIExtComponent).exists()).toBeFalsy();
    });

    it('increments key on UIExtIFrame when node info updates', async () => {
        let wrapper = shallowMount(UIExtension, {
            ...context,
            props: getMockIFrameProps()
        });
        const uiExtIFrameBefore = wrapper.findComponent(UIExtIFrame).vm;
        let { extensionConfig } = getMockIFrameProps();
        extensionConfig.resourceInfo.url = 'http://localhost:8080/your_iframe_widget.html';
        
        await wrapper.setProps({ extensionConfig });

        expect(wrapper.findComponent(UIExtIFrame).vm).not.toBe(uiExtIFrameBefore);
    });

    it('increments key on UIExtComponent when node info updates', async () => {
        let wrapper = shallowMount(UIExtension, {
            ...context,
            props: getMockComponentProps()
        });
        const uiExtComponentBefore = wrapper.findComponent(UIExtComponent).vm;
        let { extensionConfig } = getMockComponentProps();
        extensionConfig.resourceInfo.url = 'http://localhost:8080/your_vue_widget.html';
        
        await wrapper.setProps({ extensionConfig });

        expect(wrapper.findComponent(UIExtComponent).vm).not.toBe(uiExtComponentBefore);
    });

    it('creates and registers a KnimeService instance during mount', () => {
        let registerServiceMock = vi.fn();
        let props = getMockComponentProps();
        let wrapper = shallowMount(UIExtension, {
            global: {
                mocks: {
                    $store: createPagebuilderStore({ registerServiceMock })
                }
            },
            props
        });
        expect(registerServiceMock).toHaveBeenCalledWith(expect.anything(), {
            service: expect.any(KnimeService)
        });
        expect(KnimeService).toBeCalledWith(
            props.extensionConfig,
            wrapper.vm.callService,
            wrapper.vm.pushEvent
        );
    });

    it('pushes service event via the pagebuilder store', async () => {
        let pushEventMock = vi.fn();
        let props = getMockComponentProps();
        let wrapper = shallowMount(UIExtension, {
            global: {
                mocks: {
                    $store: createPagebuilderStore({ pushEventMock })
                }
            },
            props
        });
        let event = { agent: '007' };
        await wrapper.vm.pushEvent(event);
        expect(pushEventMock).toHaveBeenCalledWith(expect.anything(), event);
    });

    it('dispatches service calls to the api store', async () => {
        let callServiceMock = vi.fn();
        let props = getMockComponentProps();
        let wrapper = shallowMount(UIExtension, {
            global: {
                mocks: {
                    $store: createPagebuilderStore({ callServiceMock })
                }
            },
            props
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
        });
    });

    describe('handling messages', () => {
        const mockAlert = { message: 'Shaken not stirred.' };

        it('displays alerts via push event', async () => {
            let pushEventMock = vi.fn();
            let props = getMockComponentProps();
            let wrapper = shallowMount(UIExtension, {
                global: {
                    mocks: {
                        $store: createPagebuilderStore({ pushEventMock })
                    }
                },
                props
            });
            let handleAlertSpy = vi.spyOn(wrapper.vm, 'handleAlert');
            let event = { type: 'alert', alert: mockAlert };
            await wrapper.vm.pushEvent(event);
            expect(pushEventMock).not.toHaveBeenCalled();
            expect(handleAlertSpy).toHaveBeenCalledWith(mockAlert);
        });

        it('displays alerts via extensionConfig', () => {
            const message = 'test error';
            let props = {
                ...getMockComponentProps(),
                extensionConfig: {
                    ...getMockComponentProps().extensionConfig,
                    nodeInfo: {
                        nodeWarnMessage: null,
                        nodeErrorMessage: message
                    }
                }
            };
            const wrapper = shallowMount(UIExtension, {
                ...context,
                props
            });
            const expectedAlert = { message, type: 'error', subtitle: '', nodeId: props.extensionConfig.nodeId };
            expect(wrapper.vm.alert).toStrictEqual(expectedAlert);
        });

        it('sets alerts locally', () => {
            let wrapper = shallowMount(UIExtension, {
                ...context,
                props: getMockComponentProps()
            });
            let showAlertSpy = vi.spyOn(wrapper.vm.$store._actions['pagebuilder/alert/showAlert'], '0');
            wrapper.vm.handleAlert(mockAlert);
            expect(showAlertSpy).not.toHaveBeenCalled();
            expect(wrapper.vm.alert).toStrictEqual(mockAlert);
        });

        it('sets alerts via pagebuilder store', () => {
            let wrapper = shallowMount(UIExtension, {
                ...context,
                props: getMockComponentProps()
            });
            wrapper.vm.$store.state.pagebuilder.isDialogLayout = true;
            let showAlertSpy = vi.spyOn(wrapper.vm.$store._actions['pagebuilder/alert/showAlert'], '0');
            wrapper.vm.handleAlert(mockAlert);
            expect(showAlertSpy).toHaveBeenCalledWith({
                ...mockAlert, callback: wrapper.vm.closeAlert
            });
            expect(wrapper.vm.alert).toBeFalsy();
        });

        it('removes local alerts', async () => {
            let wrapper = shallowMount(UIExtension, {
                ...context,
                props: getMockComponentProps()
            });
            await wrapper.setData({ alert: mockAlert });
            wrapper.vm.closeAlert(true);
            expect(wrapper.vm.alert).toBeFalsy();
        });
    });

    describe('displaying messages', () => {
        it('displays error alerts', async () => {
            let mockErrorAlert = { message: 'Shaken not stirred.', type: 'error' };
            let wrapper = shallowMount(UIExtension, {
                ...context,
                props: getMockComponentProps()
            });
            let showAlertSpy = vi.spyOn(wrapper.vm, 'showAlert');
            await wrapper.setData({ alert: mockErrorAlert });
            let alertLocal = wrapper.findComponent(AlertLocal);
            expect(alertLocal.exists()).toBeTruthy();
            alertLocal.vm.$emit('showAlert');
            expect(showAlertSpy).toHaveBeenCalledWith(mockErrorAlert);
        });

        it('displays warning alerts', async () => {
            let mockWarningAlert = { message: 'Bond, James Bond.', type: 'warn' };
            let wrapper = shallowMount(UIExtension, {
                ...context,
                props: getMockComponentProps()
            });
            let showAlertSpy = vi.spyOn(wrapper.vm, 'showAlert');
            await wrapper.setData({ alert: mockWarningAlert });
            let warningButton = wrapper.findComponent(WarningLocal);
            expect(warningButton.exists()).toBeTruthy();
            warningButton.vm.$emit('click');
            expect(showAlertSpy).toHaveBeenCalledWith(mockWarningAlert);
        });

        it('clears alerts', async () => {
            let mockWarningAlert = { message: 'M' };
            let wrapper = shallowMount(UIExtension, {
                ...context,
                props: getMockComponentProps()
            });
            await wrapper.setData({ alert: mockWarningAlert });
            expect(wrapper.vm.alert).toStrictEqual(mockWarningAlert);
            wrapper.vm.closeAlert();
            // expect nothing
            expect(wrapper.vm.alert).toStrictEqual(mockWarningAlert);
            wrapper.vm.closeAlert(true);
            expect(wrapper.vm.alert).toBeNull();
        });
    });

    it('deregisters a KnimeService instance during unmount', () => {
        let deregisterServiceMock = vi.fn();
        let props = getMockComponentProps();
        let wrapper = shallowMount(UIExtension, {
            global: {
                mocks: {
                    $store: createPagebuilderStore({ deregisterServiceMock })
                }
            },
            props
        });
        expect(deregisterServiceMock).not.toHaveBeenCalled();
        wrapper.unmount();
        expect(deregisterServiceMock).toHaveBeenCalledWith(expect.anything(), {
            service: expect.any(KnimeService)
        });
    });

    describe('styling', () => {
        it('respects resize classes', () => {
            viewConfig.resizeMethod = 'aspectRatio1by1';
            let wrapper = shallowMount(UIExtension, {
                ...context,
                props: getMockIFrameProps()
            });
            expect(wrapper.find('div').attributes('class')).toBe('aspectRatio1by1');
            viewConfig.resizeMethod = 'aspectRatio16by9';
            wrapper = shallowMount(UIExtension, {
                ...context,
                props: getMockIFrameProps()
            });
            expect(wrapper.find('div').attributes('class')).toBe('aspectRatio16by9');
        });

        it('renders with classes and styles', () => {
            let wrapper = shallowMount(UIExtension, {
                ...context,
                props: {
                    ...getMockIFrameProps(),
                    viewConfig: {
                        resizeMethod: 'aspectRatio1by1',
                        additionalClasses: ['class1', 'class2'],
                        additionalStyles: ['color: red;', 'border: 1px solid green;']
                    }
                }
            });
            expect(wrapper.attributes('class')).toBe('aspectRatio1by1 class1 class2');
            expect(wrapper.attributes('style')).toBe('color: red; border: 1px solid green;');
        });

        it('adds classes for min/max height & width', () => {
            let wrapper = shallowMount(UIExtension, {
                ...context,
                props: {
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
            expect(wrapper.attributes('class')).toBe('class1 class2');
            expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green; max-height: 200px;' +
                ' max-width: 200px; min-height: 100px; min-width: 100px;');
        });
    });
});
