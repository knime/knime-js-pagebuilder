import Row from '@/components/layout/Row';
import Column from '@/components/layout/Column';
import { mount, shallowMount } from '@vue/test-utils';

describe('Row.vue', () => {

    it('renders without classes and styles', () => {
        let wrapper = shallowMount(Row, {
            propsData: {
                row: {
                    type: 'row',
                    additionalClasses: [],
                    additionalStyles: [],
                    columns: []
                }
            }
        });
        expect(wrapper.is('div')).toBe(true);
        expect(wrapper.attributes('class')).toEqual('row');
        expect(wrapper.attributes('style')).toBeUndefined();
    });

    it('renders with classes and styles', () => {
        let wrapper = shallowMount(Row, {
            propsData: {
                row: {
                    type: 'row',
                    additionalClasses: ['class1', 'class2'],
                    additionalStyles: ['color: red;', 'border: 1px solid green;'],
                    columns: []
                }
            }
        });
        expect(wrapper.attributes('class')).toEqual('row class1 class2');
        expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green;');
    });

    it('renders columns', () => {
        let columns = [
            { widthXS: 6 },
            { widthXS: 12 }
        ];

        let wrapper = mount(Row, {
            propsData: {
                row: {
                    type: 'row',
                    columns
                }
            }
        });

        const columnArray = wrapper.findAll(Column);
        expect(columnArray.length).toBe(columns.length);
        columns.forEach((column, i) => {
            let columnComponent = columnArray.at(i);
            expect(columnComponent.is(Column)).toBe(true);
            expect(columnComponent.props('column')).toEqual(columns[i]);
        });
    });

});
