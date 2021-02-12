<script>
import TreeSelectItem from './TreeSelectItem';

let ITEM_ID = 0;

/*
 * TreeSelect component.
 * Tree with single and multi-selection, keyboard navigation. Suitable for a file system tree view.
 */
export default {
    components: {
        TreeSelectItem
    },
    props: {
        data: {
            type: Array,
            required: true
        },
        multiple: {
            type: Boolean,
            default: false
        },
        allowTransition: {
            type: Boolean,
            default: true
        },
        itemHeight: {
            type: Number,
            default: 22
        },
        ariaLabel: {
            type: String,
            required: true
        },
        isValid: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            lastClickedNode: null,
            currentKeyboardNavNode: null
        };
    },
    created() {
        this.initializeData(this.data);
    },
    methods: {
        createModelObject(item) {
            let model = {
                id: item.id || ITEM_ID++,
                text: item.text || '',
                value: item.value || item.text,
                icon: item.icon || '',
                selectedIcon: item.selectedIcon || '',
                opened: Boolean(item.opened),
                selected: Boolean(item.selected),
                disabled: Boolean(item.disabled),
                children: item.children || []
            };
            if (item.userData) {
                model.userData = item.userData;
            }
            return model;
        },
        initializeData(items) {
            if (items && items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    items[i] = this.createModelObject(items[i]);
                    this.initializeData(items[i].children);
                }
            }
        },
        handleRecursionNodeChilds(node, func) {
            if (func(node) !== false) {
                if (node.$children && node.$children.length > 0) {
                    for (let childNode of node.$children) {
                        if (!childNode.disabled) {
                            this.handleRecursionNodeChilds(childNode, func);
                        }
                    }
                }
            }
        },
        runInSection(array, firstIndex, secondIndex, func) {
            let start = firstIndex > secondIndex ? secondIndex : firstIndex;
            let end = firstIndex > secondIndex ? firstIndex : secondIndex;
            array.slice(start, end + 1).forEach(func);
        },
        onItemClick(oriNode, oriItem, e) {
            if (this.multiple) {
                if (e.shiftKey) {
                    if (oriNode.$parent === this.lastClickedNode.$parent) {
                        let currentLevel = oriNode.$parent.$children;
                        let firstIndex = currentLevel.findIndex(v => v === this.lastClickedNode);
                        let secondIndex = currentLevel.findIndex(v => v === oriNode);
                        this.runInSection(currentLevel, firstIndex, secondIndex, node => {
                            node.model.selected = true;
                        });
                    } else {
                        // deselect all and just select the current clicked node if parents are not the same
                        this.handleSingleSelectItems(oriNode);
                    }
                } else if (e.ctrlKey || e.metaKey) {
                    oriNode.model.selected = !oriNode.model.selected;
                } else {
                    this.handleSingleSelectItems(oriNode);
                }
                // remember node for shift actions
                this.lastClickedNode = oriNode;
            } else {
                this.handleSingleSelectItems(oriNode);
            }
            this.currentKeyboardNavNode = oriNode;
            this.$emit('item-click', oriNode, oriItem, e);
        },
        handleSingleSelectItems(oriNode) {
            this.handleRecursionNodeChilds(this, node => {
                if (node.model) {
                    node.model.selected = false;
                }
            });
            oriNode.model.selected = true;
        },
        onItemToggle(oriNode, oriItem, e) {
            this.$emit('item-toggle', oriNode, oriItem, e);
        },
        onHoverItem() {
            // reset current keyboard state if any other item is hovered (mouse)
            if (this.currentKeyboardNavNode !== null) {
                this.currentKeyboardNavNode.$data.isKeyNav = false;
            }
        },
        nextNode(startNode, delta) {
            let siblings = this.filterForTreeSelectItems(startNode.$parent.$children);
            let currentIndex = siblings.findIndex(v => v === startNode);
            let nextIndex = currentIndex + delta;
            // next item is either the parent (if index underflow)
            return nextIndex in siblings ? siblings[nextIndex] : null;
        },
        resetIsHover() {
            this.handleRecursionNodeChilds(this, node => {
                if (node.isHover) {
                    node.isHover = false;
                }
            });
        },
        /**
         * Remove all non TreeSelectItems from $children array, not recursive
         *
         * @param {Array} $children
         * @returns {Array}
         */
        filterForTreeSelectItems($children) {
            return $children.filter(x => x.$options.name === 'TreeSelectItem');
        },
        moveKeyBoardFocus(delta) {
            let up = delta < 0;
            let down = !up;
            if (this.currentKeyboardNavNode === null) {
                const directTreeItems = this.filterForTreeSelectItems(this.$children);
                if (directTreeItems.length === 0) {
                    return; // end here - nothing to navigate
                }
                // just use first item as nav item
                this.currentKeyboardNavNode = directTreeItems[0];
            }
            let nextKeyboardNavNode = null;
            // handle open node (go one level deeper)
            if (this.currentKeyboardNavNode.model.children.length > 0 &&
                this.currentKeyboardNavNode.model.opened && down) {
                // use first item of children (we go down)
                nextKeyboardNavNode = this.filterForTreeSelectItems(this.currentKeyboardNavNode.$children)[0];
            } else {
                // next node (on current level)
                nextKeyboardNavNode = this.nextNode(this.currentKeyboardNavNode, delta);
            }
            // handle out of bounds of $children
            let childArrayOutOfBounds = nextKeyboardNavNode === null;
            if (childArrayOutOfBounds) {
                if (!this.currentKeyboardNavNode.$parent.model) {
                    return; // no parent - end here
                }
                if (up) { // we go up
                    // go to parent if there is one
                    nextKeyboardNavNode = this.currentKeyboardNavNode.$parent;
                } else { // we go down
                    nextKeyboardNavNode = this.nextNode(this.currentKeyboardNavNode.$parent, delta);
                    if (nextKeyboardNavNode === null) {
                        return; // parent has no sibling
                    }
                }
            }

            // we go up to an open node (so go the last child of that node) if we did not change level
            if (nextKeyboardNavNode.model.opened && up && !childArrayOutOfBounds) {
                // use last item of children (we go up)
                const nextTreeItems = this.filterForTreeSelectItems(nextKeyboardNavNode.$children);
                nextKeyboardNavNode = nextTreeItems[nextTreeItems.length - 1];
            }

            // reset hover state (mouse)
            this.resetIsHover();

            // set/reset hover state
            this.currentKeyboardNavNode.$data.isKeyNav = false;
            nextKeyboardNavNode.$data.isKeyNav = true;

            // update current node in $data
            this.currentKeyboardNavNode = nextKeyboardNavNode;
        },
        onArrowUp() {
            this.moveKeyBoardFocus(-1);
            this.scrollToCurrent();
        },
        onArrowDown() {
            this.moveKeyBoardFocus(1);
            this.scrollToCurrent();
        },
        onArrowLeft(e) {
            if (!this.currentKeyboardNavNode) {
                return;
            }
            if (this.currentKeyboardNavNode.model.opened) {
                this.currentKeyboardNavNode.handleItemToggle(e);
            }
        },
        onArrowRight(e) {
            if (!this.currentKeyboardNavNode) {
                return;
            }
            if (!this.currentKeyboardNavNode.model.opened) {
                this.currentKeyboardNavNode.handleItemToggle(e);
            }
        },
        onEnterKey(e) {
            if (!this.currentKeyboardNavNode) {
                return;
            }
            if (this.currentKeyboardNavNode.model.disabled || this.currentKeyboardNavNode.$data.isKeyNav === false) {
                return;
            }
            if (this.multiple && (e.ctrlKey || e.metaKey)) {
                this.currentKeyboardNavNode.model.selected = !this.currentKeyboardNavNode.model.selected;
            } else {
                this.handleSingleSelectItems(this.currentKeyboardNavNode);
            }
        },
        scrollToCurrent() {
            if (!this.currentKeyboardNavNode) {
                return;
            }
            return this.scrollToElement(this.$refs.treeDiv,
                this.currentKeyboardNavNode.$el.querySelector('.tree-wholerow'));
        },
        // NOTE: this method can be moved to webapps-common as util - and can be used instead of the method
        //       scrollToCurrent of MultiSelectListBox and ListBox
        scrollToElement(scrollArea, element) {
            if (scrollArea.scrollHeight > scrollArea.clientHeight) {
                let scrollBottom = scrollArea.clientHeight + scrollArea.scrollTop;
                let elementBottom = element.offsetTop + element.offsetHeight;
                if (elementBottom > scrollBottom) {
                    scrollArea.scrollTop = elementBottom - scrollArea.clientHeight;
                } else if (element.offsetTop < scrollArea.scrollTop) {
                    scrollArea.scrollTop = element.offsetTop;
                }
            }
        }
    }
};
</script>

<template>
  <div :class="['tree-wrapper', { invalid: !isValid } ]">
    <div
      ref="treeDiv"
      class="tree"
      role="tree"
    >
      <ul
        :aria-label="ariaLabel"
        class="tree-container-ul tree-children tree-wholerow-ul"
        role="group"
        tabindex="0"
        @keydown.up.prevent.exact="onArrowUp"
        @keydown.down.prevent.exact="onArrowDown"
        @keydown.enter.prevent="onEnterKey"
        @keydown.left.prevent.exact="onArrowLeft"
        @keydown.right.prevent.exact="onArrowRight"
      >
        <TreeSelectItem
          v-for="(child, index) in data"
          :key="index"
          :data="child"
          :allow-transition="allowTransition"
          :height="itemHeight"
          :parent-item="data"
          :on-item-click="onItemClick"
          :on-item-toggle="onItemToggle"
          :on-hover-item="onHoverItem"
        />
      </ul>
      <span
        v-if="!isValid"
        class="invalid-marker"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.tree-wrapper {
  position: relative;
  overflow: hidden;
  border: none;

  &.invalid::after {
    content: '';
    position: absolute;
    width: 3px;
    left: 0;
    margin: 0;
    top: 0;
    bottom: 0;
    background-color: var(--theme-color-error);
  }
}

.tree {
  height: 250px;
  background: var(--knime-white);
  border: 1px solid var(--knime-stone-gray);
  overflow-y: auto;
  user-select: none;

  &:focus-within {
    border-color: var(--knime-masala);
  }
}

.tree-container-ul {
  padding: 15px 0;
  margin: 0 0 0 -5px;
  list-style-type: none;

  /* for ellipsis */
  max-width: calc(100% + 5px);

  /* remove default focus style */
  &:focus {
    outline: none;
  }
}

.tree-wholerow-ul {
  position: relative;
  display: inline-block;
  min-width: 100%;

  & >>> .tree-anchor,
  & >>> .tree-icon {
    position: relative;
  }

  & >>> .tree-wholerow {
    width: 100%;
    position: absolute;
    left: 0;
    margin-left: 5px;
  }
}

</style>
