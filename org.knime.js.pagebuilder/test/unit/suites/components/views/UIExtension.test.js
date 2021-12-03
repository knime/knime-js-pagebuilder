import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { KnimeService } from 'knime-ui-extension-service';
jest.mock('knime-ui-extension-service');

import * as serviceStoreConfig from '~/store/service';

import UIExtension from '@/components/views/UIExtension';
import UIExtComponent from '@/components/views/UIExtComponent';
import UIExtIFrame from '@/components/views/UIExtIFrame';
import { iFrameExtensionConfig, componentExtensionConfig } from '../../../assets/views/extensionConfig';


describe('UIExtension.vue', () => {
    const createStore = ({ callServiceMock = jest.fn(), registerServiceMock }) => {
        let storeConfig = {
            modules: {
                service: serviceStoreConfig,
                api: {
                    actions: {
                        callService: callServiceMock
                    },
                    namespaced: true
                }
            }
        };
        if (registerServiceMock) {
            storeConfig.modules.service.actions.registerService = registerServiceMock;
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
        expect(wrapper.vm.configKey).toBe(0);
        let { extensionConfig } = getMockIFrameProps();
        extensionConfig.resourceInfo.url = 'http://localhost:8080/your_widget.html';
        wrapper.setProps({ extensionConfig });
        expect(wrapper.vm.configKey).toBe(1);
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
        expect(KnimeService).toBeCalledWith(propsData.extensionConfig, wrapper.vm.callService);
    });

    it('dispatches service calls to the api store', async () => {
        let callServiceMock = jest.fn();
        let propsData = getMockComponentProps();
        let wrapper = shallowMount(UIExtension, {
            localVue,
            store: createStore({ callServiceMock }),
            propsData
        });
        let request = { agent: '007' };
        await wrapper.vm.callService(request);
        expect(callServiceMock).toHaveBeenCalledWith(expect.anything(), { request }, expect.undefined);
    });
});
