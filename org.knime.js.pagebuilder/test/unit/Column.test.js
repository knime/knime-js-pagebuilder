import { shallowMount } from '@vue/test-utils';

import Column from '@/components/layout/Column';
import NodeView from '@/components/layout/NodeView';

// this is required because the Row component is imported asynchronously in Column, cf.
// https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components
const Row = {
    name: 'Row',
    template: '<b class="row" />',
    props: ['rowConfig']
};

const stubs = {
    Row
};

describe('Column.vue', () => {

    it('renders without classes and styles', () => {
        let wrapper = shallowMount(Column, {
            stubs,
            propsData: {
                columnConfig: {
                    widthXS: 6,
                    additionalClasses: [],
                    additionalStyles: []
                }
            }
        });
        expect(wrapper.is('div')).toBe(true);
        expect(wrapper.attributes('class')).toEqual('col col-6');
        expect(wrapper.attributes('style')).toBeUndefined();
    });

    it('renders with classes and styles', () => {
        let wrapper = shallowMount(Column, {
            stubs,
            propsData: {
                columnConfig: {
                    widthXS: 6,
                    additionalClasses: ['class1', 'class2'],
                    additionalStyles: ['color: red;', 'border: 1px solid green;']
                }
            }
        });
        expect(wrapper.attributes('class')).toEqual('col col-6 class1 class2');
        expect(wrapper.attributes('style')).toEqual('color: red; border: 1px solid green;');
    });

    it('renders responsive grid classes', () => {
        let wrapper = shallowMount(Column, {
            stubs,
            propsData: {
                columnConfig: {
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
            .toEqual('col col-12 col-sm-8 col-md-11 col-lg-10 col-xl-9 class1 class2');
    });

    it('renders default responsive grid class if no width defined', () => {
        let wrapper = shallowMount(Column, {
            stubs,
            propsData: {
                columnConfig: {}
            }
        });
        expect(wrapper.attributes('class')).toEqual('col col-12');
    });

    it('renders views', () => {
        let content = [{
            type: 'view',
            nodeID: '9:0:4'
        }, {
            type: 'JSONLayoutViewContent',
            nodeID: '9:0:5'
        }];

        let wrapper = shallowMount(Column, {
            stubs,
            propsData: {
                columnConfig: {
                    content
                }
            }
        });

        const [views, rows, divs] = [wrapper.findAll(NodeView), wrapper.findAll(Row), wrapper.findAll('div div')];
        expect(views.length).toBe(2);
        expect(views.at(0).props('viewConfig')).toBe(content[0]);
        expect(views.at(1).props('viewConfig')).toBe(content[1]);
        expect(rows.length).toBe(0);
        expect(divs.length).toBe(0);
    });

    it('renders child rows', () => {
        let content = [{
            type: 'row',
            dummy: 'dummy'
        }, {
            type: 'JSONLayoutRow',
            foo: 'bar'
        }];

        let wrapper = shallowMount(Column, {
            stubs,
            propsData: {
                columnConfig: {
                    content
                }
            }
        });

        const [views, rows, divs] = [wrapper.findAll(NodeView), wrapper.findAll(Row), wrapper.findAll('div div')];
        expect(views.length).toBe(0);
        expect(rows.length).toBe(2);
        expect(rows.at(0).props('rowConfig')).toEqual({ type: 'row', dummy: 'dummy' });
        expect(rows.at(1).props('rowConfig')).toEqual({ type: 'JSONLayoutRow', foo: 'bar' });
        expect(divs.length).toBe(0);
    });

    it('renders nested layouts', () => {
        let content = [{
            type: 'nestedLayout',
            layout: {
                rows: [{
                    type: 'row',
                    dummy: 'dummy'
                }, {
                    type: 'row',
                    foo: 'bar'
                }]
            }
        }, {
            type: 'JSONNestedLayout',
            layout: {
                rows: [{
                    type: 'JSONLayoutRow',
                    baz: 'qux'
                }]
            }
        }];

        let wrapper = shallowMount(Column, {
            stubs,
            propsData: {
                columnConfig: {
                    content
                }
            }
        });

        const [views, rows, divs] = [wrapper.findAll(NodeView), wrapper.findAll(Row), wrapper.findAll('div div')];
        expect(views.length).toBe(0);
        // eslint-disable-next-line no-magic-numbers
        expect(rows.length).toBe(3);
        expect(rows.at(0).props('rowConfig')).toEqual({ type: 'row', dummy: 'dummy' });
        expect(rows.at(1).props('rowConfig')).toEqual({ type: 'row', foo: 'bar' });
        expect(rows.at(2).props('rowConfig')).toEqual({ type: 'JSONLayoutRow', baz: 'qux' });
        expect(divs.length).toBe(0);
    });

    it('renders HTML', () => {
        let html = '<span>foo</span>';
        let html2 = '<span>bar</span>';

        let wrapper = shallowMount(Column, {
            stubs,
            propsData: {
                columnConfig: {
                    content: [{
                        type: 'html',
                        value: html
                    },
                    {
                        type: 'JSONLayoutHTMLContent',
                        value: html2
                    }]
                }
            }
        });

        const [views, rows, divs] = [wrapper.findAll(NodeView), wrapper.findAll(Row), wrapper.findAll('div div')];
        expect(views.length).toBe(0);
        expect(rows.length).toBe(0);
        expect(divs.length).toBe(2);
        expect(divs.at(0).html()).toEqual(`<div>${html}</div>`);
        expect(divs.at(1).html()).toEqual(`<div>${html2}</div>`);
    });

});
