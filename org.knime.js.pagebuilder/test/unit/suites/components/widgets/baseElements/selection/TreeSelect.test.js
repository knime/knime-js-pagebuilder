/* eslint-disable no-magic-numbers */
import { mount, shallowMount } from '@vue/test-utils';

import TreeSelect from '@/components/widgets/baseElements/selection/TreeSelect';
import TreeSelectItem from '@/components/widgets/baseElements/selection/TreeSelectItem';

import customIcon from 'webapps-common/ui/assets/img/icons/activity.svg';
import customSelectedIcon from 'webapps-common/ui/assets/img/icons/cart.svg';

describe('TreeSelect.vue', () => {
    let context, propsData;

    beforeEach(() => {
        propsData = {
            data: [
                {
                    text: 'Item 1',
                    value: 'item1',
                    userData: 1,
                    icon: customIcon,
                    selectedIcon: customSelectedIcon,
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

    it('renders custom icon', () => {
        let wrapper = mount(TreeSelect, {
            ...context,
            propsData
        });
        expect(wrapper.find(TreeSelectItem).find(customIcon).isVisible()).toBeTruthy();
        expect(wrapper.find(TreeSelectItem).find(customSelectedIcon).exists()).toBeFalsy();
    });

    it('renders custom selected icon', () => {
        propsData.data[0].selected = true;
        let wrapper = mount(TreeSelect, {
            ...context,
            propsData
        });
        expect(wrapper.find(TreeSelectItem).find(customIcon).exists()).toBeFalsy();
        expect(wrapper.find(TreeSelectItem).find(customSelectedIcon).isVisible()).toBeTruthy();
    });

    it('updates text in TreeSelectItem dynamically', () => {
        let wrapper = mount(TreeSelect, {
            ...context,
            propsData
        });
        const test = 'SOME_UNIQUE_TEST_STRING_34as834asjf';
        wrapper.vm.$props.data[0].text = test;
        expect(wrapper.find(TreeSelectItem).text()).toContain(test);
    });

    it('updates model of TreeSelectItem on data changes', () => {
        let wrapper = mount(TreeSelect, {
            ...context,
            propsData
        });
        const item = wrapper.find(TreeSelectItem);
        item.setProps({
            data: {
                text: 'changed',
                value: 'c'
            }
        });
        expect(item.vm.model.text).toStrictEqual('changed');
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

        it('opens children on double click', () => {
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            expect(propsData.data[0].opened).toBe(false);

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(0).trigger('dblclick');

            expect(propsData.data[0].opened).toBe(true);
        });

        it('closes children on double click if open', () => {
            propsData.data[0].opened = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            expect(propsData.data[0].opened).toBe(true);

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(0).trigger('dblclick');

            expect(propsData.data[0].opened).toBe(false);
        });

        it('ignores click on disabled item', () => {
            propsData.data[0].disabled = true;

            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            expect(propsData.data[0].children[0].selected).toStrictEqual(true);
            expect(propsData.data[0].selected).toStrictEqual(false);
            wrapper.findAll('.tree-anchor').at(0).trigger('click');
            expect(propsData.data[0].children[0].selected).toStrictEqual(true);
            expect(propsData.data[0].selected).toStrictEqual(false);
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

        it('marks hovered items', () => {
            propsData.multiple = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });
            const anchor = wrapper.find('.tree-anchor');
            const item = wrapper.find(TreeSelectItem);

            anchor.trigger('mouseover');
            expect(item.vm.$data.isHover).toBeTruthy();
            anchor.trigger('mouseout');
            expect(item.vm.$data.isHover).toBeFalsy();
        });

        it('removes keyboard navigation state on hover', () => {
            propsData.data[0].opened = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');

            // use keynav to have a currentKeyBoardNavNode
            anchors.at(4).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            // move mouse over different item
            anchors.at(0).trigger('mouseover', {});

            expect(wrapper.vm.currentKeyboardNavNode.$data.isKeyNav).toBe(false);
            expect(wrapper.findAll(TreeSelectItem).at(0).vm.$data.isHover).toStrictEqual(true);
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

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('item3');
        });

        it('navigates across levels using up key', () => {
            propsData.data[0].opened = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(2).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('child1');
        });

        it('does not navigate down using up key if we reached the top', () => {
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });
            const items = wrapper.findAll(TreeSelectItem);

            wrapper.setData({
                currentKeyboardNavNode: items.at(0).vm
            });
            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('item1');

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('item1');
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

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('item4');
        });

        it('does not navigate down using down key if we reached the end', () => {
            propsData.data[3].children = [{
                value: 'lastChild',
                text: 'Last Child'
            }];
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });
            const items = wrapper.findAll(TreeSelectItem);

            wrapper.setData({
                currentKeyboardNavNode: items.at(7).vm // the lastChild
            });
            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('lastChild');

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('lastChild');
        });

        it('navigates across levels using down key', () => {
            propsData.data[0].opened = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const items = wrapper.findAll(TreeSelectItem);

            wrapper.setData({
                currentKeyboardNavNode: items.at(3).vm
            });
            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('child2');

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('item2');
        });

        it('navigates into open tree using down key', () => {
            propsData.data[0].opened = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('child1');
        });

        it('navigates into open tree using up key', () => {
            propsData.data[0].opened = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            anchors.at(4).trigger('mouseover', {});
            anchors.at(4).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('child2');
            expect(wrapper.findAll(TreeSelectItem).at(4).vm.$data.isHover).toStrictEqual(false);
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

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('item4');

            container.trigger('keydown.enter');

            expect(propsData.data[3].selected).toStrictEqual(true);

            // last selection (click) should be removed
            expect(propsData.data[2].selected).toStrictEqual(false);
        });

        it('does not select disabled item on enter key', () => {
            propsData.data[3].disabled = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            // last clicked one is starting point
            anchors.at(5).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('item4');

            container.trigger('keydown.enter');

            expect(propsData.data[3].selected).toStrictEqual(false);

            // last selection (click) still active
            expect(propsData.data[2].selected).toStrictEqual(true);
        });

        it('adds item to selected on enter + ctrl', () => {
            propsData.multiple = true;
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const anchors = wrapper.findAll('.tree-anchor');
            // last clicked one is starting point
            anchors.at(5).trigger('click', {});
            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.down');

            expect(wrapper.vm.currentKeyboardNavNode.model.value).toStrictEqual('item4');

            container.trigger('keydown.enter', { ctrlKey: true });

            expect(propsData.data[3].selected).toStrictEqual(true);

            // last selection (click) should be removed
            expect(propsData.data[2].selected).toStrictEqual(true);
        });

        it('opens children on right arrow key', () => {
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

        it('closes children on left arrow key', () => {
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

        it('does not break on empty tree', () => {
            propsData.data = [];
            let wrapper = mount(TreeSelect, {
                ...context,
                propsData
            });

            const container = wrapper.find('.tree-container-ul');
            container.trigger('keydown.up');
            container.trigger('keydown.down');
            container.trigger('keydown.left');
            container.trigger('keydown.right');
            container.trigger('keydown.enter');
        });
    });

    it('scrolls to element correctly', () => {
        propsData.data = [];
        let wrapper = shallowMount(TreeSelect, {
            ...context,
            propsData
        });
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
