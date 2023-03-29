import { expect, describe, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import Row from '@/components/layout/Row.vue';
import Column from '@/components/layout/Column.vue';

describe('Row.vue', () => {
    it('renders without classes and styles', () => {
        let wrapper = shallowMount(Row, {
            props: {
                rowConfig: {
                    type: 'row',
                    additionalClasses: [],
                    additionalStyles: [],
                    columns: []
                }
            }
        });
        expect(wrapper.element.tagName).toBe('DIV');
        expect(wrapper.attributes('class')).toBe('row');
        expect(wrapper.attributes('style')).toBe('');
    });

    it('renders with classes and styles', () => {
        let wrapper = shallowMount(Row, {
            props: {
                rowConfig: {
                    type: 'row',
                    additionalClasses: ['class1', 'class2'],
                    additionalStyles: ['color: red;', 'border: 1px solid green;'],
                    columns: []
                }
            }
        });
        expect(wrapper.attributes('class')).toBe('row class1 class2');
        expect(wrapper.attributes('style')).toBe('color: red; border: 1px solid green;');
    });


    it('renders headless class', () => {
        let wrapper = shallowMount(Row);
        expect(wrapper.classes()).not.toContain('headless');

        window.headless = true;
        wrapper = shallowMount(Row);
        expect(wrapper.classes()).toContain('headless');

        delete window.headless;
    });

    it('renders columns', () => {
        let columns = [
            { widthXS: 6 },
            { widthXS: 12 }
        ];

        let wrapper = shallowMount(Row, {
            props: {
                rowConfig: {
                    type: 'row',
                    columns
                }
            }
        });

        const columnArray = wrapper.findAllComponents(Column);
        expect(columnArray.length).toBe(columns.length);
        columns.forEach((column, i) => {
            let columnComponent = columnArray.at(i);
            expect(columnComponent.props('columnConfig')).toEqual(columns[i]);
        });
    });
});
