import { shallowMount } from '@vue/test-utils';

import IntegerWidget from '@/components/widgets/input/IntegerWidget.vue';

describe('IntegerWidget.vue', () => {
    let mountOptions;

    beforeEach(() => {
        mountOptions = {
            propsData: {
                nodeConfig: {
                    viewRepresentation: {
                        '@class': 'org.knime.js.base.node.base.input.integer.IntegerNodeRepresentation',
                        defaultValue: {
                            '@class': 'org.knime.js.base.node.base.input.integer.IntegerNodeValue',
                            integer: 0
                        },
                        currentValue: {
                            '@class': 'org.knime.js.base.node.base.input.integer.IntegerNodeValue',
                            integer: 0
                        }
                    },
                    nodeInfo: {},
                    getViewValueMethodName: 'value'
                },
                nodeId: 'id1',
                isValid: false,
                type: 'integer'
            },
            stubs: {
                NumberWidget: {
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
        let wrapper = shallowMount(IntegerWidget, mountOptions);
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.find(mountOptions.stubs.NumberWidget).exists()).toBeTruthy();
    });

    it('passes-through all props', () => {
        let wrapper = shallowMount(IntegerWidget, mountOptions);
        expect(wrapper.find(mountOptions.stubs.NumberWidget).vm.$attrs).toEqual(mountOptions.propsData);
    });

    it('passes-through all listeners', () => {
        let wrapper = shallowMount(IntegerWidget, mountOptions);
        expect(wrapper.find(mountOptions.stubs.NumberWidget).vm.$listeners).toHaveProperty('fakeEvent');
    });

    describe('passes-through methods', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(IntegerWidget, mountOptions);
        });

        it('validate', () => {
            let validate = mountOptions.stubs.NumberWidget.methods.validate;
            expect(validate).not.toBeCalled();
            wrapper.vm.validate();
            expect(validate).toBeCalled();
        });
    
        it('onChange', () => {
            let onChange = mountOptions.stubs.NumberWidget.methods.onChange;
            expect(onChange).not.toBeCalled();
            wrapper.vm.onChange();
            expect(onChange).toBeCalled();
        });
    });
});
