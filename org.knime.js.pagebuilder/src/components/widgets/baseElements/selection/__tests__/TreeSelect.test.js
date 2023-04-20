import { expect, describe, beforeEach, it } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import { markRaw } from 'vue';

import TreeSelect from '@/components/widgets/baseElements/selection/TreeSelect.vue';
import TreeSelectItem from '@/components/widgets/baseElements/selection/TreeSelectItem.vue';

import customIcon from 'webapps-common/ui/assets/img/icons/activity.svg';
import customSelectedIcon from 'webapps-common/ui/assets/img/icons/cart.svg';

describe('TreeSelect.vue', () => {
    let props;

    beforeEach(() => {
        props = {
            data: [
                {
                    text: 'Item 1',
                    value: 'item1',
                    userData: 1,
                    icon: markRaw(customIcon),
                    selectedIcon: markRaw(customSelectedIcon),
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
        const wrapper = mount(TreeSelect, { props });
        expect(wrapper.html()).toBeTruthy();
        expect(wrapper.isVisible()).toBeTruthy();
    });

    it('renders custom icon', () => {
        const wrapper = mount(TreeSelect, { props });
        expect(wrapper.findComponent(TreeSelectItem).findComponent(customIcon).isVisible()).toBeTruthy();
        expect(wrapper.findComponent(TreeSelectItem).findComponent(customSelectedIcon).exists()).toBeFalsy();
    });

    it('renders custom selected icon', () => {
        props.data[0].selected = true; const wrapper = mount(TreeSelect, { props });
        expect(wrapper.findComponent(TreeSelectItem).findComponent(customIcon).exists()).toBeFalsy();
        expect(wrapper.findComponent(TreeSelectItem).findComponent(customSelectedIcon).isVisible()).toBeTruthy();
    });

    it('updates text in TreeSelectItem dynamically', async () => {
        const wrapper = mount(TreeSelect, { props });
        const test = 'SOME_UNIQUE_TEST_STRING_34as834asjf';
        wrapper.vm.$props.data[0].text = test;
        await wrapper.vm.$nextTick();
        const item = wrapper.findComponent(TreeSelectItem);
        expect(item.text()).toContain(test);
        expect(item.vm.model.text).toStrictEqual(test);
    });

    describe('mouse interaction', () => {
        it('selects item on click', () => {
            const wrapper = mount(TreeSelect, { props });

            expect(props.data[0].children[0].selected).toBe(true);
            expect(props.data[0].selected).toBe(false);
            wrapper.findAll('.tree-anchor').at(0).trigger('click');
            expect(props.data[0].children[0].selected).toBe(false);
            expect(props.data[0].selected).toBe(true);
        });

        it('opens children on double click', () => {
            const wrapper = mount(TreeSelect, { props });

            expect(props.data[0].opened).toBe(false);

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(0).trigger('dblclick');

            expect(props.data[0].opened).toBe(true);
        });

        it('closes children on double click if open', () => {
            props.data[0].opened = true;
            const wrapper = mount(TreeSelect, { props });

            expect(props.data[0].opened).toBe(true);

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(0).trigger('dblclick');

            expect(props.data[0].opened).toBe(false);
        });

        it('ignores click on disabled item', () => {
            props.data[0].disabled = true;

            const wrapper = mount(TreeSelect, { props });

            expect(props.data[0].children[0].selected).toBe(true);
            expect(props.data[0].selected).toBe(false);
            wrapper.findAll('.tree-anchor').at(0).trigger('click');
            expect(props.data[0].children[0].selected).toBe(true);
            expect(props.data[0].selected).toBe(false);
        });

        it('selects item on click even if multiple is active', () => {
            props.multiple = true;
            const wrapper = mount(TreeSelect, { props });

            expect(props.data[0].children[0].selected).toBe(true);
            expect(props.data[0].selected).toBe(false);
            wrapper.findAll('.tree-anchor').at(0).trigger('click');
            expect(props.data[0].children[0].selected).toBe(false);
            expect(props.data[0].selected).toBe(true);
        });

        it('adds item to selected on click if multiple selections is allowed', () => {
            props.multiple = true;
            const wrapper = mount(TreeSelect, { props });

            expect(props.data[0].selected).toBe(false);
            wrapper.findAll('.tree-anchor').at(0).trigger('click', { ctrlKey: true });
            expect(props.data[0].selected).toBe(true);
            expect(props.data[0].children[0].selected).toBe(true);
        });

        it('removes item from selected items on ctrl + click', () => {
            props.multiple = true;
            props.data[0].selected = true;
            const wrapper = mount(TreeSelect, { props });

            wrapper.findAll('.tree-anchor').at(0).trigger('click', { ctrlKey: true });
            expect(props.data[0].selected).toBe(false);
            expect(props.data[0].children[0].selected).toBe(true);
        });

        it('selects multiple items on shift + click', () => {
            props.multiple = true;
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            // index is different because list contains all items also nested ones
            anchors.at(4).trigger('click', {});
            anchors.at(6).trigger('click', { shiftKey: true });

            // 3 items are selected
            expect(props.data[1].selected).toBe(true);
            expect(props.data[2].selected).toBe(true);
            expect(props.data[3].selected).toBe(true);
            // default selection should be removed
            expect(props.data[0].children[0].selected).toBe(false);
        });

        it('selects only clicked item if levels mismatch on shift + click', () => {
            props.multiple = true;
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            // index is different because list contains all items also nested ones
            anchors.at(4).trigger('click', {});
            anchors.at(2).trigger('click', { shiftKey: true });

            expect(props.data[0].children[0].children[0].selected).toBe(true);
            expect(props.data[1].selected).toBe(false);
            // default selection should be removed
            expect(props.data[0].children[0].selected).toBe(false);
        });

        it('marks hovered items', () => {
            props.multiple = true;
            const wrapper = mount(TreeSelect, { props });
            const anchor = wrapper.find('.tree-anchor');
            const item = wrapper.findComponent(TreeSelectItem);

            anchor.trigger('mouseover');
            expect(item.vm.$data.isHover).toBeTruthy();
            anchor.trigger('mouseout');
            expect(item.vm.$data.isHover).toBeFalsy();
        });

        it('removes keyboard navigation state on hover', () => {
            props.data[0].opened = true;
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');

            // use keynav to have a currentKeyBoardNavNode
            anchors.at(4).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            // move mouse over different item
            anchors.at(0).trigger('mouseover', {});

            expect(wrapper.vm.currentKeyboardNavNode.$data.isKeyNav).toBe(false);
            expect(wrapper.findAllComponents(TreeSelectItem).at(0).vm.$data.isHover).toBe(true);
        });
    });

    describe('keyboard interaction', () => {
        it('navigates up using up key', () => {
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(6).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('item3');
        });

        it('navigates across levels using up key', () => {
            props.data[0].opened = true;
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(2).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('child1');
        });

        it('does not navigate down using up key if we reached the top', async () => {
            const wrapper = mount(TreeSelect, { props });
            const items = wrapper.findAllComponents(TreeSelectItem);

            await wrapper.setData({
                currentKeyboardNavNode: items.at(0).vm
            });
            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('item1');

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('item1');
        });

        it('navigates down using down key', () => {
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            // last clicked one is starting point
            anchors.at(5).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('item4');
        });

        it('does not navigate down using down key if we reached the end', async () => {
            props.data[3].children = [{
                value: 'lastChild',
                text: 'Last Child'
            }];
            const wrapper = mount(TreeSelect, { props });
            const items = wrapper.findAllComponents(TreeSelectItem);

            await wrapper.setData({
                currentKeyboardNavNode: items.at(7).vm // the lastChild
            });
            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('lastChild');

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('lastChild');
        });

        it('navigates across levels using down key', async () => {
            props.data[0].opened = true;
            const wrapper = mount(TreeSelect, { props });

            const items = wrapper.findAllComponents(TreeSelectItem);

            await wrapper.setData({
                currentKeyboardNavNode: items.at(3).vm
            });
            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('child2');

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('item2');
        });

        it('navigates into open tree using down key', () => {
            props.data[0].opened = true;
            const wrapper = mount(TreeSelect, { props });

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('child1');
        });

        it('navigates into open tree using up key', () => {
            props.data[0].opened = true;
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(4).trigger('mouseover', {});
            anchors.at(4).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('child2');
            expect(wrapper.findAllComponents(TreeSelectItem).at(4).vm.$data.isHover).toBe(false);
        });

        it('selects item on enter key', () => {
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            // last clicked one is starting point
            anchors.at(5).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('item4');

            container.trigger('keydown.enter');

            expect(props.data[3].selected).toBe(true);

            // last selection (click) should be removed
            expect(props.data[2].selected).toBe(false);
        });

        it('does not select disabled item on enter key', () => {
            props.data[3].disabled = true;
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            // last clicked one is starting point
            anchors.at(5).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('item4');

            container.trigger('keydown.enter');

            expect(props.data[3].selected).toBe(false);

            // last selection (click) still active
            expect(props.data[2].selected).toBe(true);
        });

        it('adds item to selected on enter + ctrl', () => {
            props.multiple = true;
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            // last clicked one is starting point
            anchors.at(5).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toBe('item4');

            container.trigger('keydown.enter', { ctrlKey: true });

            expect(props.data[3].selected).toBe(true);

            // last selection (click) should be removed
            expect(props.data[2].selected).toBe(true);
        });

        it('opens children on right arrow key', () => {
            const wrapper = mount(TreeSelect, { props });

            expect(props.data[0].opened).toBe(false);

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(0).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.right');

            expect(props.data[0].opened).toBe(true);
        });

        it('closes children on left arrow key', () => {
            props.data[0].opened = true;
            const wrapper = mount(TreeSelect, { props });

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(0).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.left');

            expect(props.data[0].opened).toBe(false);
        });

        it('does not break on empty tree', () => {
            props.data = [];
            const wrapper = mount(TreeSelect, { props });

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');
            container.trigger('keydown.down');
            container.trigger('keydown.left');
            container.trigger('keydown.right');
            container.trigger('keydown.enter');
        });
    });

    it('scrolls to element correctly', () => {
        props.data = []; const wrapper = shallowMount(TreeSelect, { props });
        const scrollToElement = wrapper.vm.scrollToElement;

        let area = {
            clientHeight: 0,
            scrollTop: 0,
            scrollHeight: 0
        };
        let el = {
            offsetTop: 120,
            offsetHeight: 150
        };

        // nothing happens if all is visible without scrollbar (scrollHeight is not bigger then clientHeight)
        scrollToElement(area, el);
        expect(area.scrollTop).toBe(0);

        // scroll to element at bottom (of area)
        area.scrollHeight = 300;
        area.clientHeight = 200;
        area.scrollTop = 50;
        scrollToElement(area, el);
        expect(area.scrollTop).toBe(70); // 120 + 150 - 200

        // scroll to element at top (of area)
        area.scrollHeight = 300;
        area.clientHeight = 100;
        area.scrollTop = 50;
        el.offsetTop = 40;
        el.offsetHeight = 70;
        scrollToElement(area, el);
        expect(area.scrollTop).toBe(40); // just offsetTop
    });
});
