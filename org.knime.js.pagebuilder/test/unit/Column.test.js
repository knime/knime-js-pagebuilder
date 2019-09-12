import Column from '@/components/layout/Column';
import { mount, shallowMount } from '@vue/test-utils';

describe('Column.vue', () => {

    it('renders without classes and styles', () => {
        let wrapper = shallowMount(Column, {
            propsData: {
                column: {
                    widthXS: 6,
                    additionalClasses: [],
                    additionalStyles: []
                }
            }
        });
        expect(wrapper.is('div')).toBe(true);
        expect(wrapper.attributes('class')).toEqual('col col-xs-6');
        expect(wrapper.attributes('style')).toBeUndefined();
    });

    it('renders with classes and styles', () => {
        let wrapper = shallowMount(Column, {
            propsData: {
                column: {
                    widthXS: 6,
                    additionalClasses: ['class1', 'class2'],
                    additionalStyles: ['color: red;', 'border: 1px solid green;']
                }
            }
        });
        expect(wrapper.attributes('class')).toEqual('col col-xs-6 class1 class2');
        expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green;');
    });

    it('renders responsive grid classes', () => {
        let wrapper = shallowMount(Column, {
            propsData: {
                column: {
                    widthXS: 12,
                    widthMD: 11,
                    widthLG: 10,
                    widthXL: 9,
                    widthSM: 8,
                    additionalClasses: ['class1', 'class2']
                }
            }
        });
        expect(wrapper.attributes('class'))
            .toEqual('col col-xs-12 col-sm-8 col-md-11 col-lg-10 col-xl-9 class1 class2');
    });

    it('renders default responsive grid class if no width defined', () => {
        let wrapper = shallowMount(Column, {
            propsData: {
                column: {}
            }
        });
        expect(wrapper.attributes('class')).toEqual('col col-xs-12');
    });

    /*
    it('renders column content', () => {
        let content = [{
            type: 'view',
            nodeID: '9:0:4'
        }, {
            type: 'view',
            nodeID: '9:0:5'
        }];

        let wrapper = mount(Column, {
            propsData: {
                column: {
                    content
                }
            },
            stubs: {
                NodeView: true
            }
        });

        const contentArray = wrapper.findAll(ColumnContent);
        expect(contentArray.length).toBe(content.length);
        content.forEach((column, i) => {
            let contentComponent = contentArray.at(i);
            expect(contentComponent.is(ColumnContent)).toBe(true);
            expect(contentComponent.props('item')).toEqual(content[i]);
        });
    });
    */

});
