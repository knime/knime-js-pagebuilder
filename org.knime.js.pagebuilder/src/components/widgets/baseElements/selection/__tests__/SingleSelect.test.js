import { expect, describe, beforeEach, it } from 'vitest';
import { shallowMount, mount } from '@vue/test-utils';

import SingleSelect from '@/components/widgets/baseElements/selection/SingleSelect.vue';
import RadioButtons from 'webapps-common/ui/components/forms/RadioButtons.vue';
import ListBox from 'webapps-common/ui/components/forms/ListBox.vue';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown.vue';

describe('SingleSelect.vue', () => {
    let propsRadioHorizontal, propsRadioVertical, propsDropdown, propsList;

    beforeEach(() => {
        propsRadioHorizontal = {
            label: 'Radio Hor',
            possibleValueList: [
                'O1 ',
                '',
                'Option 2',
                'O3'
            ],
            value: 'O3',
            type: 'Radio buttons (horizontal)',
            limitNumberVisOptions: false,
            numberVisOptions: 10,
            isValid: false
        };

        propsRadioVertical = {
            label: 'Radio Vertical',
            value: 'O3',
            possibleValueList: [
                'O1 ',
                '',
                'Option 2',
                'O3'
            ],
            type: 'Radio buttons (vertical)',
            limitNumberVisOptions: false,
            numberVisOptions: 10,
            isValid: false
        };

        propsDropdown = {
            label: 'Dropdown',
            value: 'Option 2',
            possibleValueList: [
                'Option 1',
                'Option 2',
                'Option 3',
                ''
            ],
            type: 'Dropdown',
            limitNumberVisOptions: false,
            numberVisOptions: 10,
            isValid: false
        };

        propsList = {
            label: 'List',
            value: 'List Item 3',
            possibleValueList: [
                'List Item 1',
                'List Item 2',
                'List Item 3',
                'List Item 4',
                'List Item 5',
                'List Item 6',
                'List Item 7',
                'List Item 8',
                'List Item 9',
                'List Item 10',
                'List Item 11',
                'List Item 12',
                'List Item 13',
                'List Item 14',
                'List Item 15', // duplicate test
                'List Item 15',
                '',
                'List Item 16'
            ],
            type: 'List',
            limitNumberVisOptions: true,
            numberVisOptions: 5,
            isValid: false
        };
    });

    it('renders empty', () => {
        let wrapper = shallowMount(SingleSelect);
        expect(wrapper.exists());
    });

    describe('radiobuttons', () => {
        it('renders horizontal', () => {
            let wrapper = shallowMount(SingleSelect, {
                props: propsRadioHorizontal
            });

            let rb = wrapper.findComponent(RadioButtons);
            expect(rb.exists()).toBe(true);
            expect(rb.props('alignment')).toBe('horizontal');
        });

        it('fails on invalid type (alignment)', () => {
            propsRadioHorizontal.type = 'Radio buttons (vulcano)';
            let wrapper = shallowMount(SingleSelect, {
                props: propsRadioHorizontal
            });

            expect(wrapper.vm.radioButtonsAlignment).toBeNull();
            expect(wrapper.findComponent(RadioButtons).exists()).toBe(false);
        });

        it('renders vertical', () => {
            let wrapper = shallowMount(SingleSelect, {
                props: propsRadioVertical
            });

            let rb = wrapper.findComponent(RadioButtons);
            expect(rb.exists()).toBe(true);
            expect(rb.props('alignment')).toBe('vertical');
        });

        it('emits @update:modelValue', () => {
            let wrapper = shallowMount(SingleSelect, {
                props: propsRadioVertical
            });

            const testValue = 'VALUE';
            const lb = wrapper.findComponent(RadioButtons);
            lb.vm.$emit('update:modelValue', testValue);

            expect(wrapper.emitted('update:modelValue')).toBeTruthy();
            expect(wrapper.emitted('update:modelValue')[0][0]).toStrictEqual(testValue);
        });
    });

    describe('list', () => {
        it('renders', () => {
            let wrapper = shallowMount(SingleSelect, {
                props: propsList
            });

            expect(wrapper.findComponent(ListBox).exists()).toBe(true);
        });

        it('has size set', () => {
            propsList.isValid = true;
            let wrapper = shallowMount(SingleSelect, {
                props: propsList
            });
            let size = propsList.numberVisOptions;
            expect(wrapper.findComponent(ListBox).props('size')).toBe(size);
        });

        it('does not render duplicate entries', () => {
            propsList.possibleValueList = ['1', '2', '3', '3', '3', '4'];
            let wrapper = mount(SingleSelect, {
                props: propsList
            });
            // duplicate entry will not be shown twice
            const choicesUnique = [...new Set(propsList.possibleValueList)].length;
            expect(wrapper.vm.possibleChoices.length).toBe(choicesUnique);
        });

        it('defaults to 0 if no size is set', () => {
            const localThis = {
                viewRep: {
                    limitNumberVisOptions: false
                }
            };
            expect(SingleSelect.computed.maxVisibleListEntries.call(localThis)).toBe(0);
        });

        it('passes isValid to component', () => {
            let wrapper = shallowMount(SingleSelect, {
                props: {
                    ...propsList,
                    isValid: false
                }
            });
            expect(wrapper.findComponent(ListBox).props('isValid')).toBe(false);
        });

        it('emits @update:modelValue', () => {
            let wrapper = shallowMount(SingleSelect, {
                props: propsList
            });

            const testValue = 'VALUE';
            const lb = wrapper.findComponent(ListBox);
            lb.vm.$emit('update:modelValue', testValue);

            expect(wrapper.emitted('update:modelValue')).toBeTruthy();
            expect(wrapper.emitted('update:modelValue')[0][0]).toStrictEqual(testValue);
        });
    });

    describe('dropdown', () => {
        it('renders', () => {
            let wrapper = shallowMount(SingleSelect, {
                props: propsDropdown
            });

            expect(wrapper.findComponent(Dropdown).exists()).toBe(true);
        });

        it('passes isValid to component', () => {
            let wrapper = shallowMount(SingleSelect, {
                props: {
                    ...propsDropdown,
                    isValid: false
                }
            });
            expect(wrapper.findComponent(Dropdown).props('isValid')).toBe(false);
        });

        it('emits @update:modelValue', () => {
            let wrapper = shallowMount(SingleSelect, {
                props: propsDropdown
            });

            const testValue = 'VALUE';
            const lb = wrapper.findComponent(Dropdown);
            lb.vm.$emit('update:modelValue', testValue);

            expect(wrapper.emitted('update:modelValue')).toBeTruthy();
            expect(wrapper.emitted('update:modelValue')[0][0]).toStrictEqual(testValue);
        });
    });

    it('provides a hasSelection method for validation', () => {
        let wrapper = mount(SingleSelect, {
            props: propsList
        });

        expect(wrapper.vm.hasSelection()).toBe(true);
    });
});
