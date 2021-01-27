import { mount } from '@vue/test-utils';

import TreeSelect from '@/components/widgets/baseElements/selection/TreeSelect';

describe('TreeSelect.vue', () => {
    let context, propsData;

    beforeEach(() => {
        propsData = {
            data: [
                {
                    text: 'Item 1',
                    value: 'item1',
                    userData: 3,
                    children: [
                        {
                            text: 'Child 1',
                            value: 'child1',
                            selected: true,
                            children: [
                                { text: 'child-level-3' }
                            ]
                        },
                        {
                            text: 'Child 2',
                            value: 'child2',
                            disabled: true
                        }
                    ]
                }
            ],
            ariaLabel: 'Tree',
            multiple: false
        };
    });

    it('renders', () => {
        let wrapper = mount(TreeSelect, {
            ...context,
            propsData
        });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('selects item on click', () => {
        let wrapper = mount(TreeSelect, {
            ...context,
            propsData
        });

        expect(propsData.data[0].children[0].selected).toStrictEqual(true);
        expect(propsData.data[0].selected).toStrictEqual(false);
        wrapper.findAll('.tree-anchor').at(0).trigger('click');
        expect(propsData.data[0].children[0].selected).toStrictEqual(false);
        expect(propsData.data[0].selected).toStrictEqual(true);
    });

    it('adds item to selected on click if multiple selections is allowed', () => {
        propsData.multiple = true;
        let wrapper = mount(TreeSelect, {
            ...context,
            propsData
        });

        expect(propsData.data[0].selected).toStrictEqual(false);
        wrapper.findAll('.tree-anchor').at(0).trigger('click', { ctrlKey: true });
        expect(propsData.data[0].selected).toStrictEqual(true);
        expect(propsData.data[0].children[0].selected).toStrictEqual(true);
    });

    it('remove item from selected on ctrl + click', () => {
        propsData.multiple = true;
        propsData.data[0].selected = true;
        let wrapper = mount(TreeSelect, {
            ...context,
            propsData
        });

        wrapper.findAll('.tree-anchor').at(0).trigger('click', { ctrlKey: true });
        expect(propsData.data[0].selected).toStrictEqual(false);
        expect(propsData.data[0].children[0].selected).toStrictEqual(true);
    });

});
