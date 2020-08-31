import { mount, shallowMount } from '@vue/test-utils';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';
import propsDataColumnLockedListImport from '~/test/unit/assets/propsDataColumnLockedList';
import propsDataRadioHorizontalImport from '~/test/unit/assets/propsDataRadioHorizontal';
import propsDataRadioVerticalImport from '~/test/unit/assets/propsDataRadioVertical';
import propsDataDropdownImport from '~/test/unit/assets/propsDataDropdown';
import propsDataListImport from '~/test/unit/assets/propsDataList';

import ValueSelectionWidget from '@/components/widgets/selection/ValueSelectionWidget';

describe('ValueSelectionWidget.vue', () => {

    let propsDataColumnLockedList, propsDataRadioHorizontal, propsDataRadioVertical, propsDataDropdown, propsDataList;

    beforeEach(() => {
        propsDataColumnLockedList = JSON.parse(JSON.stringify(propsDataColumnLockedListImport));
        propsDataRadioHorizontal = JSON.parse(JSON.stringify(propsDataRadioHorizontalImport));
        propsDataRadioVertical = JSON.parse(JSON.stringify(propsDataRadioVerticalImport));
        propsDataDropdown = JSON.parse(JSON.stringify(propsDataDropdownImport));
        propsDataList = JSON.parse(JSON.stringify(propsDataListImport));
    });

    describe('render', () => {
        it('renders as radio buttons horizontal', () => {
            let wrapper = shallowMount(ValueSelectionWidget, {
                propsData: propsDataRadioHorizontal
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as radio buttons vertical', () => {
            let wrapper = shallowMount(ValueSelectionWidget, {
                propsData: propsDataRadioVertical
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as list', () => {
            let wrapper = shallowMount(ValueSelectionWidget, {
                propsData: propsDataList
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as dropdown', () => {
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataDropdown
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.findAll(Dropdown).length).toBe(2);
            expect(wrapper.isVisible()).toBeTruthy();
        });

        it('renders as list with column locked', () => {
            let wrapper = shallowMount(ValueSelectionWidget, {
                propsData: propsDataColumnLockedList
            });

            expect(wrapper.html()).toBeTruthy();
            expect(wrapper.isVisible()).toBeTruthy();
        });
    });

    it('sends @updateWidget if SingleSelect emits @input', () => {
        let wrapper = mount(ValueSelectionWidget, {
            propsData: propsDataRadioVertical
        });

        const testValue = 'VALUE';
        const lb = wrapper.find({ ref: 'form' });
        lb.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsDataRadioVertical.nodeId,
            type: 'value',
            value: testValue
        });
    });

    it('sends @updateWidget if column emits @input', () => {
        let wrapper = mount(ValueSelectionWidget, {
            propsData: propsDataRadioVertical
        });

        const testValue = 'MYCOL';
        const lb = wrapper.find({ ref: 'column' });
        lb.vm.$emit('input', testValue);

        expect(wrapper.emitted().updateWidget).toBeTruthy();
        expect(wrapper.emitted().updateWidget[0][0]).toStrictEqual({
            nodeId: propsDataRadioVertical.nodeId,
            type: 'column',
            value: testValue
        });
    });

    it('has size set', () => {
        propsDataList.isValid = true;
        propsDataList.nodeConfig.viewRepresentation.limitNumberVisOptions = true;
        let wrapper = mount(ValueSelectionWidget, {
            propsData: propsDataList
        });
        let size = propsDataList.nodeConfig.viewRepresentation.numberVisOptions;
        expect(wrapper.find({ ref: 'form' }).props('numberVisOptions')).toBe(size);
    });

    it('does not render duplicate entries', () => {
        propsDataDropdown.nodeConfig.viewRepresentation.possibleColumns = ['1', '2', '3', '3', '3', '4'];

        let wrapper = mount(ValueSelectionWidget, {
            propsData: propsDataDropdown
        });
        // duplicate column entry will not be shown twice
        // eslint-disable-next-line no-magic-numbers
        expect(wrapper.vm.possibleColumns.length).toBe(4);
    });

    it('passes isValid to component', () => {
        let wrapper = mount(ValueSelectionWidget, {
            propsData: {
                ...propsDataList,
                isValid: false
            }
        });
        expect(wrapper.find({ ref: 'form' }).props('isValid')).toBe(false);
    });

    describe('validation', () => {
        it('is valid if not required and no selection made', () => {
            propsDataList.nodeConfig.viewRepresentation.required = false;
            let wrapper = mount(ValueSelectionWidget, {
                propsData: {
                    ...propsDataList,
                    valuePair: {
                        value: '',
                        column: 'Cluster Membership'
                    }
                }
            });

            expect(wrapper.vm.validate().isValid).toBe(true);
        });

        it('invalidates with unlocked column and invalid column selected', () => {
            propsDataDropdown.nodeConfig.viewRepresentation.required = true;
            propsDataDropdown.nodeConfig.viewRepresentation.lockColumn = false;
            propsDataDropdown.nodeConfig.viewRepresentation.currentValue.column = 'INVALID';
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataDropdown
            });
            // invalid column should not display any possible or selected values
            expect(wrapper.vm.value).toStrictEqual('');
            expect(wrapper.vm.possibleValueList).toStrictEqual([]);
            // it should return the correct invalid response for validation
            expect(wrapper.vm.validate())
                .toStrictEqual({ isValid: false, errorMessage: 'Selected column is invalid.' });
        });

        it('is invalid if required and no selection was made', () => {
            propsDataList.nodeConfig.viewRepresentation.required = true;
            propsDataList.nodeConfig.viewRepresentation.lockColumn = true;
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataList
            });
            wrapper.setProps({ valuePair: {
                value: '',
                column: 'Cluster Membership'
            } });
            expect(wrapper.vm.validate()).toStrictEqual({ isValid: false, errorMessage: 'Selection is required.' });
        });

        it('is valid if required and a selection was made', () => {
            propsDataDropdown.nodeConfig.viewRepresentation.lockColumn = true;
            propsDataDropdown.valuePair = { value: 'URI: http://cepetakagtksslf; EXT: ', column: 'UriCol' };
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataDropdown
            });
            expect(wrapper.vm.validate()).toStrictEqual({ isValid: true, errorMessage: null });
        });

        it('handles child validation', () => {
            propsDataDropdown.nodeConfig.viewRepresentation.required = true;
            propsDataDropdown.nodeConfig.viewRepresentation.lockColumn = true;
            propsDataDropdown.valuePair = { value: 'URI: http://cepetakagtksslf; EXT: ', column: 'UriCol' };
            let childResponse = { isValid: false, errorMessage: 'test Error Message' };
            let wrapper = mount(ValueSelectionWidget, {
                propsData: propsDataDropdown,
                stubs: {
                    SingleSelect: {
                        template: '<div />',
                        methods: {
                            validate: jest.fn().mockReturnValueOnce(childResponse)
                                .mockReturnValueOnce({ isValid: false })
                        }
                    }
                }
            });
            // child message
            expect(wrapper.vm.validate()).toStrictEqual(childResponse);
            // default message
            expect(wrapper.vm.validate())
                .toStrictEqual({ isValid: false, errorMessage: 'Selection is invalid or missing.' });
        });
    });
});
