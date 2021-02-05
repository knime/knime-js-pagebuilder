/* eslint-disable no-magic-numbers */
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
                    userData: 1,
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
                },
                {
                    text: 'Item 2',
                    value: 'item2'
                },
                {
                    text: 'Item 3',
                    value: 'item3'
                },
                {
                    text: 'Item 4',
                    value: 'item4'
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

    describe('mouse interaction', () => {

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

        it('selects item on click even if multiple is active', () => {
            propsData.multiple = true;
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

        it('removes item from selected items on ctrl + click', () => {
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

        it('selects multiple items on shift + click', () => {
            propsData.multiple = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            // index is different because list contains all items also nested ones
            anchors.at(4).trigger('click', {});
            anchors.at(6).trigger('click', { shiftKey: true });

            // 3 items are selected
            expect(propsData.data[1].selected).toStrictEqual(true);
            expect(propsData.data[2].selected).toStrictEqual(true);
            expect(propsData.data[3].selected).toStrictEqual(true);
            // default selection should be removed
            expect(propsData.data[0].children[0].selected).toStrictEqual(false);
        });

        it('selects only clicked item if levels mismatch on shift + click', () => {
            propsData.multiple = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            // index is different because list contains all items also nested ones
            anchors.at(4).trigger('click', {});
            anchors.at(2).trigger('click', { shiftKey: true });

            expect(propsData.data[0].children[0].children[0].selected).toStrictEqual(true);
            expect(propsData.data[1].selected).toStrictEqual(false);
            // default selection should be removed
            expect(propsData.data[0].children[0].selected).toStrictEqual(false);
        });

    });

    describe('keyboard interaction', () => {

        it('navigates up using up key', () => {
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(6).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            expect(wrapper.vm.currentKeyboardNavNode.id).toBe(anchors.at(5).id);
        });

        it('navigates down using down key', () => {
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            // last clicked one is starting point
            anchors.at(5).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.id).toBe(anchors.at(6).id);
        });

        it('navigates into open tree using down key', () => {
            propsData.data[0].opened = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.id).toBe(anchors.at(1).id);
        });

        it('navigates into open tree using up key', () => {
            propsData.data[0].opened = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(4).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            expect(wrapper.vm.currentKeyboardNavNode.id).toBe(anchors.at(3).id);
        });


        it('selects item on enter key', () => {
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            // last clicked one is starting point
            anchors.at(5).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.id).toBe(anchors.at(6).id);

            container.trigger('keydown.enter');

            expect(propsData.data[3].selected).toStrictEqual(true);

            // default selection should be removed
            expect(propsData.data[0].children[0].selected).toStrictEqual(false);
        });

        it('open children on right arrow key', () => {
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            expect(propsData.data[0].opened).toBe(false);

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(0).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.right');

            expect(propsData.data[0].opened).toBe(true);
        });

        it('close children on left arrow key', () => {
            propsData.data[0].opened = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(0).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.left');

            expect(propsData.data[0].opened).toBe(false);
        });

    });

});
