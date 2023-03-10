import { expect, describe, beforeEach, it } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';

import Multiselect from '@/components/widgets/baseElements/selection/Multiselect.vue';
import Checkboxes from 'webapps-common/ui/components/forms/Checkboxes.vue';
import MultiselectListBox from 'webapps-common/ui/components/forms/MultiselectListBox.vue';
import Twinlist from 'webapps-common/ui/components/forms/Twinlist.vue';
import Checkbox from 'webapps-common/ui/components/forms/Checkbox.vue';


describe('Multiselect.vue', () => {
    let propsTwinlist, propsCheckboxHorizontal, propsCheckboxVertical, propsMultiselectListBox;

    beforeEach(() => {
        propsTwinlist = {
            possibleValueList: [
                'TwinList 1',
                'TwinList 2',
                'TwinList 3',
                'TwinList 4',
                'TwinList 5',
                'TwinList 6',
                'TwinList 7'
            ],
            value: [
                'TwinList 3',
                'TwinList 5'
            ],
            type: 'Twinlist',
            limitNumberVisOptions: true,
            numberVisOptions: 4,
            isValid: false
        };
        propsMultiselectListBox = {
            value: [
                'List 3',
                'List 4',
                'List 7'
            ],
            possibleValueList: [
                'List 1',
                'List 2',
                'List 3',
                'List 4',
                'List 5',
                'List 6',
                'List 7',
                'List 8'
            ],
            type: 'List',
            limitNumberVisOptions: true,
            numberVisOptions: 5,
            isValid: false
        };
        propsCheckboxVertical = {
            value: [
                'CBV 2',
                'CBV 4',
                'CBV 6'
            ],
            possibleValueList: [
                'CBV 1',
                'CBV 2',
                'CBV 3',
                'CBV 4',
                'CBV 5',
                'CBV 6'
            ],
            type: 'Check boxes (vertical)',
            limitNumberVisOptions: false,
            numberVisOptions: 10,
            isValid: false
        };
        propsCheckboxHorizontal = {
            value: [
                'CBH 1',
                'CBH 4'
            ],
            possibleValueList: [
                'CBH 1',
                'CBH 2',
                'CBH 3',
                'CBH 4',
                'CBH 5',
                'CBH 6',
                'CBH 7'
            ],
            type: 'Check boxes (horizontal)',
            limitNumberVisOptions: false,
            numberVisOptions: 10,
            isValid: false
        };
    });

    it('renders all different types', () => {
        let wrapper = shallowMount(Multiselect, {
            props: propsTwinlist
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();

        let wrapper2 = shallowMount(Multiselect, {
            props: propsCheckboxHorizontal
        });
        expect(wrapper2.html()).toBeTruthy();
        expect(wrapper2.isVisible()).toBeTruthy();

        let wrapper3 = shallowMount(Multiselect, {
            props: propsCheckboxVertical
        });
        expect(wrapper3.html()).toBeTruthy();
        expect(wrapper3.isVisible()).toBeTruthy();

        let wrapper4 = shallowMount(Multiselect, {
            props: propsMultiselectListBox
        });
        expect(wrapper4.html()).toBeTruthy();
        expect(wrapper4.isVisible()).toBeTruthy();
    });

    describe('checkboxes', () => {
        it('render horizontal', () => {
            propsCheckboxHorizontal.isValid = true;
            let wrapper = mount(Multiselect, {
                props: propsCheckboxHorizontal
            });

            let checkboxes = wrapper.findComponent(Checkboxes);
            expect(checkboxes.exists()).toBeTruthy();
            expect(checkboxes.props('alignment')).toBe('horizontal');
            // eslint-disable-next-line no-magic-numbers
            expect(wrapper.findAllComponents(Checkbox).length).toBe(7);
        });

        it('render vertical', () => {
            propsCheckboxVertical.isValid = true;
            let wrapper = shallowMount(Multiselect, {
                props: propsCheckboxVertical
            });

            let checkboxes = wrapper.findComponent(Checkboxes);
            expect(checkboxes.exists()).toBeTruthy();
            expect(checkboxes.props('alignment')).toBe('vertical');
        });

        it('fail on invalid type (alignment)', () => {
            propsCheckboxVertical.type = 'Check boxes (vulcano)';
            let wrapper = mount(Multiselect, {
                props: propsCheckboxVertical
            });

            expect(wrapper.vm.checkBoxesAlignment).toBe(null);
            expect(wrapper.findComponent(Checkboxes).exists()).toBe(false);
        });

        it('emits @update:modelValue', () => {
            let props = propsCheckboxVertical;
            let wrapper = shallowMount(Multiselect, {
                props
            });

            const testValue = ['VALUE1', 'VALUE2'];
            const comp = wrapper.findComponent(Checkboxes);
            comp.vm.$emit('update:modelValue', testValue);

            expect(wrapper.emitted('update:modelValue')).toBeTruthy();
            expect(wrapper.emitted('update:modelValue')[0][0]).toStrictEqual(testValue);
        });
    });

    describe('listbox', () => {
        it('renders list box component', () => {
            propsMultiselectListBox.isValid = true;
            let wrapper = shallowMount(Multiselect, {
                props: propsMultiselectListBox
            });

            expect(wrapper.findComponent(MultiselectListBox).exists()).toBeTruthy();
        });

        it('does not render duplicate entries', () => {
            propsMultiselectListBox.possibleValueList = ['1', '2', '3', '3', '3', '4'];
            let wrapper = mount(Multiselect, {
                props: propsMultiselectListBox
            });
            // duplicate entry will not be shown twice
            const choicesUnique = [...new Set(propsMultiselectListBox.possibleValueList)].length;
            expect(wrapper.vm.possibleValues.length).toBe(choicesUnique);
        });

        it('emits @update:modelValue', () => {
            let props = propsMultiselectListBox;
            let wrapper = shallowMount(Multiselect, {
                props
            });

            const testValue = ['VALUE1', 'VALUE2'];
            const comp = wrapper.findComponent(MultiselectListBox);
            comp.vm.$emit('update:modelValue', testValue);

            expect(wrapper.emitted('update:modelValue')).toBeTruthy();
            expect(wrapper.emitted('update:modelValue')[0][0]).toStrictEqual(testValue);
        });
    });

    describe('twinlist', () => {
        it('renders component', () => {
            propsTwinlist.isValid = true;
            let wrapper = shallowMount(Multiselect, {
                props: propsTwinlist
            });

            expect(wrapper.findComponent(Twinlist).exists()).toBeTruthy();
        });

        it('size defaults to 0', () => {
            propsTwinlist.isValid = true;
            propsTwinlist.limitNumberVisOptions = false;
            let wrapper = shallowMount(Multiselect, {
                props: propsTwinlist
            });

            let rb = wrapper.findComponent(Twinlist);
            expect(rb.props('size')).toBe(0);
        });

        it('emits @update:modelValue', () => {
            let props = propsTwinlist;
            let wrapper = shallowMount(Multiselect, {
                props
            });

            const testValue = ['VALUE1', 'VALUE2'];
            const comp = wrapper.findComponent(Twinlist);
            comp.vm.$emit('update:modelValue', testValue);
            
            expect(wrapper.emitted('update:modelValue')).toBeTruthy();
            expect(wrapper.emitted('update:modelValue')[0][0]).toStrictEqual(testValue);
        });
    });
});
