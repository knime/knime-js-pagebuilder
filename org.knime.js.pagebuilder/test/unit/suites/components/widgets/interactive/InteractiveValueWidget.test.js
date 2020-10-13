import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';

import * as interactiveConfig from '~/store/interactivity';

import InteractiveValueWidget from '@/components/widgets/interactive/InteractiveValueWidget';
import Multiselect from '@/components/widgets/baseElements/selection/Multiselect';
import SingleSelect from '@/components/widgets/baseElements/selection/SingleSelect';
import Label from 'webapps-common/ui/components/forms/Label';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';

describe('InteractiveValueWidget.vue', () => {
    let propsData, localVue, store, context;

    beforeEach(() => {
        propsData = {
            nodeConfig: {
                '@class': 'org.knime.js.core.JSONWebNode',
                initMethodName: 'init',
                validateMethodName: 'validate',
                nodeInfo: {},
                javascriptLibraries: [],
                stylesheets: [],
                setValidationErrorMethodName: 'setValidationErrorMessage',
                namespace: 'org_knime_js_base_node_quickform_filter_definition_value',
                viewRepresentation: {
                    '@class':
                        'org.knime.js.base.node.quickform.filter.definition.value.ValueFilterDefinitionRepresentation',
                    tableID: '359ffa64-a233-4f2e-bf2a-c264a4048573',
                    multipleValues: false,
                    label: 'Cluster Membership',
                    disabled: false,
                    filterID: '8eb44367-7be8-4837-8f6e-4de925c79a6a',
                    limitNumberVisOptions: true,
                    possibleValues: [
                        'Cluster_0',
                        'Cluster_1',
                        'Cluster_2',
                        'Cluster_3'
                    ],
                    numberVisOptions: 10,
                    column: 'Cluster Membership',
                    type: 'List'
                },
                viewValue: {
                    '@class': 'org.knime.js.base.node.quickform.filter.definition.RangeFilterValue',
                    filter: {
                        type: 'range',
                        columns: [
                            {
                                type: 'nominal',
                                values: [
                                    'Cluster_0'
                                ],
                                columnName: 'Cluster Membership'
                            }
                        ],
                        rows: null,
                        id: '8eb44367-7be8-4837-8f6e-4de925c79a6a'
                    }
                },
                customCSS: '',
                getViewValueMethodName: 'getComponentValue'
            },
            nodeId: '3:0:52',
            isValid: false
        };

        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({ modules: { 'pagebuilder/interactivity': interactiveConfig } });

        context = {
            store,
            localVue
        };
    });

    describe('SingleSelect components', () => {
        it('renders SingleSelect', () => {
            let wrapper = mount(InteractiveValueWidget, {
                ...context,
                propsData
            });
            expect(wrapper.isVisible()).toBeTruthy();
            expect(wrapper.find(SingleSelect)).toBeTruthy();
        });

        it('uses correct label component', () => {
            let wrapperList = mount(InteractiveValueWidget, {
                ...context,
                propsData
            });
            expect(wrapperList.find(Label)).toBeTruthy();

            propsData.nodeConfig.viewRepresentation.type = 'Checkboxes';
            let wrapperOther = mount(InteractiveValueWidget, {
                ...context,
                propsData
            });
            expect(wrapperOther.find(Fieldset)).toBeTruthy();
        });
    });

    describe('Multiselect components', () => {
        it('renders Multiselect', () => {
            propsData.nodeConfig.viewRepresentation.multipleValues = true;
            let wrapper = mount(InteractiveValueWidget, {
                ...context,
                propsData
            });
            expect(wrapper.isVisible()).toBeTruthy();
            expect(wrapper.find(Multiselect)).toBeTruthy();
        });

        it('uses correct label component', () => {
            propsData.nodeConfig.viewRepresentation.multipleValues = true;
            let wrapperList = mount(InteractiveValueWidget, {
                ...context,
                propsData
            });
            expect(wrapperList.find(Label)).toBeTruthy();

            propsData.nodeConfig.viewRepresentation.type = 'Radio buttons (vertical)';
            let wrapperOther = mount(InteractiveValueWidget, {
                ...context,
                propsData
            });
            expect(wrapperOther.find(Fieldset)).toBeTruthy();
        });
    });

    it('respects settings to disable the label', () => {
        let wrapperEnable = shallowMount(InteractiveValueWidget, {
            ...context,
            propsData
        });
        expect(wrapperEnable.vm.label).toBe('Cluster Membership');

        propsData.nodeConfig.viewRepresentation.label = null;
        let wrapperDisable = shallowMount(InteractiveValueWidget, {
            ...context,
            propsData
        });
        expect(wrapperDisable.vm.label).toBe('');
    });

    it('sends @updateWidget if child emits @input', () => {
        let wrapper = shallowMount(InteractiveValueWidget, {
            ...context,
            propsData
        });

        const testValue = ['VALUE2'];
        const comp = wrapper.find(SingleSelect);
        comp.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            callback: expect.anything(),
            nodeId: propsData.nodeId,
            update: {
                'viewValue.filter.columns.0.values': testValue
            }
        });
    });

    describe('validation', () => {
        it('is always valid get value method works', () => {
            let wrapper = shallowMount(InteractiveValueWidget, {
                ...context,
                propsData
            });
            expect(wrapper.vm.validate().isValid).toBe(true);
            
            let wrapperBroken = shallowMount(InteractiveValueWidget, {
                ...context,
                propsData
            });
            jest.spyOn(wrapperBroken.vm, 'getValue').mockImplementation(() => undefined);
            expect(wrapperBroken.vm.validate().isValid).toBe(false);
        });
    });
});
