import { shallowMount } from '@vue/test-utils';

import SingleSelectionWidget from '@/components/widgets/selection/SingleSelectionWidget';

describe('SingleSelectionWidget.vue', () => {
    let mountOptions;

    beforeEach(() => {
        mountOptions = {
            propsData: {
                nodeConfig: {
                    viewRepresentation: {
                        '@class': 'org.knime.js.base.node.base.selection.singleMultiple.' +
                            'SingleMultipleSelectionNodeRepresentation',
                        defaultValue: {
                            '@class':
                                'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                            value: [
                                'O3'
                            ]
                        },
                        currentValue: {
                            '@class':
                                'org.knime.js.base.node.base.selection.singleMultiple.SingleMultipleSelectionNodeValue',
                            value: [
                                'O3'
                            ]
                        },
                        possibleChoices: [
                            'O1 ',
                            'Option 2',
                            'O3'
                        ]
                    },
                    nodeInfo: {}
                },
                nodeId: 'id1',
                isValid: false,
                // viewRep handling config for single selection
                'data-type-key': 'value',
                'possible-choices-key': 'possibleChoices',
                'value-is-array': true
            },
            stubs: {
                BaseSingleSelectionWidget: {
                    template: '<div />',
                    methods: {
                        validate: jest.fn(),
                        onChange: jest.fn()
                    }
                }
            },
            listeners: {
                fakeEvent: jest.fn()
            }
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(SingleSelectionWidget, mountOptions);
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.find(mountOptions.stubs.BaseSingleSelectionWidget).exists()).toBeTruthy();
    });

    it('passes-through all props', () => {
        let wrapper = shallowMount(SingleSelectionWidget, mountOptions);
        expect(wrapper.find(mountOptions.stubs.BaseSingleSelectionWidget).vm.$attrs).toEqual(mountOptions.propsData);
    });

    it('passes-through all listeners', () => {
        let wrapper = shallowMount(SingleSelectionWidget, mountOptions);
        expect(wrapper.find(mountOptions.stubs.BaseSingleSelectionWidget).vm.$listeners).toHaveProperty('fakeEvent');
    });

    describe('passes-through methods', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(SingleSelectionWidget, mountOptions);
        });

        it('validate', () => {
            let validate = mountOptions.stubs.BaseSingleSelectionWidget.methods.validate;
            expect(validate).not.toBeCalled();
            wrapper.vm.validate();
            expect(validate).toBeCalled();
        });

        it('onChange', () => {
            let onChange = mountOptions.stubs.BaseSingleSelectionWidget.methods.onChange;
            expect(onChange).not.toBeCalled();
            wrapper.vm.onChange();
            expect(onChange).toBeCalled();
        });
    });

});
