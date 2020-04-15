import { shallowMount } from '@vue/test-utils';

import ColumnSelectionWidget from '@/components/widgets/selection/ColumnSelectionWidget';

describe('ColumnSelectionWidget.vue', () => {
    let mountOptions;

    beforeEach(() => {
        mountOptions = {
            propsData: {
                nodeConfig: {
                    viewRepresentation: {
                        '@class': 'org.knime.js.base.node.base.selection.column.ColumnSelectionNodeRepresentation',
                        defaultValue: {
                            '@class': 'org.knime.js.base.node.base.selection.column.ColumnSelectionNodeValue',
                            column: null
                        },
                        currentValue: {
                            '@class': 'org.knime.js.base.node.base.selection.column.ColumnSelectionNodeValue',
                            column: null
                        },
                        possibleColumns: [
                            'StringCol',
                            'StringListCol',
                            'StringSetCol',
                            'IntCol',
                            'IntListCol'
                        ]
                    },
                    nodeInfo: {}
                },
                nodeId: 'id1',
                isValid: false,
                // viewRep handling config for column selection
                'data-type-key': 'column',
                'possible-choices-key': 'possibleColumns',
                'value-is-array': false
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
        let wrapper = shallowMount(ColumnSelectionWidget, mountOptions);
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.find(mountOptions.stubs.BaseSingleSelectionWidget).exists()).toBeTruthy();
    });

    it('passes-through all props', () => {
        let wrapper = shallowMount(ColumnSelectionWidget, mountOptions);
        expect(wrapper.find(mountOptions.stubs.BaseSingleSelectionWidget).vm.$attrs).toEqual(mountOptions.propsData);
    });

    it('passes-through all listeners', () => {
        let wrapper = shallowMount(ColumnSelectionWidget, mountOptions);
        expect(wrapper.find(mountOptions.stubs.BaseSingleSelectionWidget).vm.$listeners).toHaveProperty('fakeEvent');
    });

    describe('passes-through methods', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(ColumnSelectionWidget, mountOptions);
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
