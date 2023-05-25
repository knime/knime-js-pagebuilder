import { expect, describe, beforeEach, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import DoubleWidget from '@/components/widgets/input/DoubleWidget.vue';

describe('DoubleWidget.vue', () => {
    let mountOptions;

    beforeEach(() => {
        mountOptions = {
            props: {
                nodeConfig: {
                    viewRepresentation: {
                        '@class': 'org.knime.js.base.node.base.input.dbl.DoubleNodeRepresentation',
                        defaultValue: {
                            '@class': 'org.knime.js.base.node.base.input.dbl.DoubleNodeValue',
                            double: 0
                        },
                        currentValue: {
                            '@class': 'org.knime.js.base.node.base.input.dbl.DoubleNodeValue',
                            double: 0
                        }
                    },
                    nodeInfo: {},
                    getViewValueMethodName: 'value'
                },
                nodeId: 'id1',
                isValid: false,
                type: 'double',
                onFakeEvent: vi.fn()
            },
            global: {
                stubs: {
                    NumberWidget: {
                        template: '<div />',
                        methods: {
                            validate: vi.fn(),
                            onChange: vi.fn()
                        }
                    }
                }
            }
        };
    });

    it('renders', () => {
        let wrapper = shallowMount(DoubleWidget, mountOptions);
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
        expect(wrapper.findComponent(mountOptions.global.stubs.NumberWidget).exists()).toBeTruthy();
    });

    it('passes-through all props', () => {
        let wrapper = shallowMount(DoubleWidget, mountOptions);
        expect(wrapper.findComponent(mountOptions.global.stubs.NumberWidget).vm.$attrs).toEqual(mountOptions.props);
    });

    describe('passes-through methods', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(DoubleWidget, mountOptions);
        });

        it('validate', () => {
            let validate = mountOptions.global.stubs.NumberWidget.methods.validate;
            expect(validate).not.toBeCalled();
            wrapper.vm.validate();
            expect(validate).toBeCalled();
        });
    
        it('onChange', () => {
            let onChange = mountOptions.global.stubs.NumberWidget.methods.onChange;
            expect(onChange).not.toBeCalled();
            wrapper.vm.onChange();
            expect(onChange).toBeCalled();
        });
    });
});
