import { shallowMount, mount } from '@vue/test-utils';

import SingleSelect from '@/components/widgets/baseElements/selection/SingleSelect.vue';
import RadioButtons from 'webapps-common/ui/components/forms/RadioButtons.vue';
import ListBox from 'webapps-common/ui/components/forms/ListBox.vue';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown.vue';

describe('SingleSelect.vue', () => {
    let propsDataRadioHorizontal, propsDataRadioVertical, propsDataDropdown, propsDataList;

    beforeEach(() => {
        propsDataRadioHorizontal = {
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

        propsDataRadioVertical = {
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

        propsDataDropdown = {
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

        propsDataList = {
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
                propsData: propsDataRadioHorizontal
            });

            let rb = wrapper.find(RadioButtons);
            expect(rb.exists()).toBe(true);
            expect(rb.props('alignment')).toBe('horizontal');
        });

        it('fails on invalid type (alignment)', () => {
            propsDataRadioHorizontal.type = 'Radio buttons (vulcano)';
            let wrapper = shallowMount(SingleSelect, {
                propsData: propsDataRadioHorizontal
            });

            expect(wrapper.vm.radioButtonsAlignment).toBe(null);
            expect(wrapper.find(RadioButtons).exists()).toBe(false);
        });

        it('renders vertical', () => {
            let wrapper = shallowMount(SingleSelect, {
                propsData: propsDataRadioVertical
            });

            let rb = wrapper.find(RadioButtons);
            expect(rb.exists()).toBe(true);
            expect(rb.props('alignment')).toBe('vertical');
        });

        it('emits @input', () => {
            let wrapper = shallowMount(SingleSelect, {
                propsData: propsDataRadioVertical
            });

            const testValue = 'VALUE';
            const lb = wrapper.find(RadioButtons);
            lb.vm.$emit('input', testValue);

            expect(wrapper.emitted().input).toBeTruthy();
            expect(wrapper.emitted().input[0][0]).toStrictEqual(testValue);
        });
    });

    describe('list', () => {
        it('renders', () => {
            let wrapper = shallowMount(SingleSelect, {
                propsData: propsDataList
            });

            expect(wrapper.find(ListBox).exists()).toBe(true);
        });

        it('has size set', () => {
            propsDataList.isValid = true;
            let wrapper = shallowMount(SingleSelect, {
                propsData: propsDataList
            });
            let size = propsDataList.numberVisOptions;
            expect(wrapper.find(ListBox).props('size')).toBe(size);
        });

        it('does not render duplicate entries', () => {
            propsDataList.possibleValueList = ['1', '2', '3', '3', '3', '4'];
            let wrapper = mount(SingleSelect, {
                propsData: propsDataList
            });
            // duplicate entry will not be shown twice
            const choicesUnique = [...new Set(propsDataList.possibleValueList)].length;
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
                propsData: {
                    ...propsDataList,
                    isValid: false
                }
            });
            expect(wrapper.find(ListBox).props('isValid')).toBe(false);
        });

        it('emits @input', () => {
            let wrapper = shallowMount(SingleSelect, {
                propsData: propsDataList
            });

            const testValue = 'VALUE';
            const lb = wrapper.find(ListBox);
            lb.vm.$emit('input', testValue);

            expect(wrapper.emitted().input).toBeTruthy();
            expect(wrapper.emitted().input[0][0]).toStrictEqual(testValue);
        });
    });

    describe('dropdown', () => {
        it('renders', () => {
            let wrapper = shallowMount(SingleSelect, {
                propsData: propsDataDropdown
            });

            expect(wrapper.find(Dropdown).exists()).toBe(true);
        });

        it('passes isValid to component', () => {
            let wrapper = shallowMount(SingleSelect, {
                propsData: {
                    ...propsDataDropdown,
                    isValid: false
                }
            });
            expect(wrapper.find(Dropdown).props('isValid')).toBe(false);
        });

        it('emits @input', () => {
            let wrapper = shallowMount(SingleSelect, {
                propsData: propsDataDropdown
            });

            const testValue = 'VALUE';
            const lb = wrapper.find(Dropdown);
            lb.vm.$emit('input', testValue);

            expect(wrapper.emitted().input).toBeTruthy();
            expect(wrapper.emitted().input[0][0]).toStrictEqual(testValue);
        });
    });

    it('provides a hasSelection method for validation', () => {
        let wrapper = mount(SingleSelect, {
            propsData: propsDataList
        });

        expect(wrapper.vm.hasSelection()).toBe(true);
    });
});
