import Vuex from 'vuex';
import { createLocalVue, shallowMount, mount } from '@vue/test-utils';

import * as serviceStoreConfig from '~/store/service';
import * as apiStoreConfig from '~/store/wrapperApi';

import ViewExecutable from '@/components/views/ViewExecutable';
import ExecutingOverlay from '@/components/ui/ExecutingOverlay';
import Button from '~/webapps-common/ui/components/Button';

import { componentExtensionConfig } from '../../../assets/views/extensionConfig';

describe('ViewExecutable.vue', () => {
    it('renders', () => {
        const wrapper = shallowMount(ViewExecutable, {
            propsData: {
                extensionConfig: { nodeInfo: { nodeState: 'executed' } }
            }
        });
        expect(wrapper.exists()).toBeTruthy();
        const executeButton = wrapper.find(Button);
        expect(executeButton.exists()).toBeTruthy();
        expect(executeButton.attributes().disabled).toBeUndefined();
    });

    describe('props validation', () => {
        it('accepts a valid extensionConfig', () => {
            const wrapper = shallowMount(ViewExecutable, {
                propsData: {
                    extensionConfig: {
                        nodeId: null,
                        workflowId: null,
                        projectId: null,
                        nodeInfo: { nodeState: 'executed' }
                    }
                }
            });
            const extensionConfigValidator = wrapper.vm.$options.props.extensionConfig.validate;
            expect(
                extensionConfigValidator({ nodeId: null, workflowId: null, projectId: null, nodeInfo: null })
            ).toBe(true);
        });

        it('declines an invalid extensionConfig', () => {
            const wrapper = shallowMount(ViewExecutable, {
                propsData: {
                    extensionConfig: {
                        nodeId: null,
                        workflowId: null,
                        projectId: null,
                        nodeInfo: { nodeState: 'executed' }
                    }
                }
            });
            const extensionConfigValidator = wrapper.vm.$options.props.extensionConfig.validate;
            expect(
                extensionConfigValidator({ workflowId: null, projectId: null })
            ).toBe(false);
            expect(
                extensionConfigValidator(['id1', 'id2'])
            ).toBe(false);
        });
    });

    describe('Save & Execute on Button Click', () => {
        const getMockComponentProps = () => ({ extensionConfig: { ...componentExtensionConfig } });
        let localVue, context, applySettingsMock, changeNodeStatesMock;

        beforeAll(() => {
            applySettingsMock = jest.fn();
            changeNodeStatesMock = jest.fn();

            localVue = createLocalVue();
            localVue.use(Vuex);

            context = {
                store: new Vuex.Store({
                    modules: {
                        'pagebuilder/dialog': {
                            ...serviceStoreConfig,
                            actions: {
                                callApplySettings: applySettingsMock
                            }
                        },
                        api: {
                            ...apiStoreConfig,
                            actions: {
                                changeNodeStates: changeNodeStatesMock
                            }
                        }
                    }
                }),
                localVue
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('shows the executing overlay', async () => {
            let propsData = getMockComponentProps();
            let wrapper = mount(ViewExecutable, {
                ...context,
                propsData
            });
            await wrapper.vm.executeViewSaveSettings();
            expect(wrapper.vm.showReexecutionOverlay).toBeTruthy();
            expect(wrapper.vm.showReexecutionSpinner).toBeTruthy();
            expect(wrapper.find(ExecutingOverlay).exists()).toBeTruthy();
        });

        it('dispatches the applySettings call to the pagebuilder/service store', async () => {
            let propsData = getMockComponentProps();
            let wrapper = shallowMount(ViewExecutable, {
                ...context,
                propsData
            });
            await wrapper.vm.executeViewSaveSettings();
            expect(applySettingsMock).toHaveBeenCalled();
        });

        it('dispatches the changeNodeState call to the api store', async () => {
            let propsData = getMockComponentProps();
            let wrapper = shallowMount(ViewExecutable, {
                ...context,
                propsData
            });
            await wrapper.vm.executeViewSaveSettings();
            expect(changeNodeStatesMock).toHaveBeenCalled();
        });

        test('Save & Execute button is disabled if node cannot be executed', () => {
            let propsData = getMockComponentProps();
            propsData.extensionConfig.nodeInfo.nodeState = 'idle';
            let wrapper = shallowMount(ViewExecutable, {
                ...context,
                propsData
            });
            expect(wrapper.find(Button).attributes().disabled).toBeTruthy();
            expect(wrapper.find('.message').text()).toContain('cannot be executed');
        });
    });
});
