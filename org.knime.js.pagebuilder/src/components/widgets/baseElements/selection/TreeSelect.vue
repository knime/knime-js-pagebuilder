<script>
import TreeSelectItem from './TreeSelectItem';

let ITEM_ID = 0;

/**
 * Model Class
 */
class Model {
    constructor(item) {
        this.id = item.id || ITEM_ID++;
        this.text = item.text || '';
        this.value = item.value || item.text;
        this.icon = item.icon || '';
        this.opened = item.opened;
        this.selected = item.selected || false;
        this.disabled = item.disabled || false;
        if (item.userData) { this.userData = item.userData; }
        this.children = item.children || [];
    }
}

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
        initializeData(items) {
            if (items && items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    items[i] = new Model(items[i]);
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
                    // TODO: mac (metaKey) might require debouncing
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
        onMouseMove() {
            // reset current keyboard hover state if user moves mouse
            if (this.currentKeyboardNavNode !== null) {
                this.currentKeyboardNavNode.$data.isHover = false;
            }
        },
        nextNode(startNode, delta) {
            let siblings = startNode.$parent.$children;
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
        moveKeyBoardFocus(delta) {
            let up = delta < 0;
            let down = !up;
            if (this.currentKeyboardNavNode === null) {
                if (this.$children.length === 0) {
                    return; // end here - nothing to navigate
                }
                // just use first item as nav item
                this.currentKeyboardNavNode = this.$children[0];
            }
            this.resetIsHover();
            let nextKeyboardNavNode = null;
            // handle open node (go one level deeper)
            if (this.currentKeyboardNavNode.model.children.length > 0 &&
                this.currentKeyboardNavNode.model.opened && down) {
                // use first item of childs (we go down)
                nextKeyboardNavNode = this.currentKeyboardNavNode.$children[0];
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
                nextKeyboardNavNode = nextKeyboardNavNode.$children[nextKeyboardNavNode.$children.length - 1];
            }

            // set/reset hover state
            this.currentKeyboardNavNode.$data.isHover = false;
            nextKeyboardNavNode.$data.isHover = true;
            // update current nod ein data
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
            if (this.currentKeyboardNavNode.model.opened) {
                this.currentKeyboardNavNode.handleItemToggle(e);
            }
        },
        onArrowRight(e) {
            if (!this.currentKeyboardNavNode.model.opened) {
                this.currentKeyboardNavNode.handleItemToggle(e);
            }
        },
        onEnterKey(e) {
            if (this.currentKeyboardNavNode.model.disabled || this.currentKeyboardNavNode.$data.isHover === false) {
                return;
            }
            if (this.multiple && (e.ctrlKey || e.metaKey)) {
                // TODO: mac (metaKey) might require debouncing
                this.currentKeyboardNavNode.model.selected = !this.currentKeyboardNavNode.model.selected;
            } else {
                this.handleSingleSelectItems(this.currentKeyboardNavNode);
            }
        },
        scrollToCurrent() {
            return this.scrollToElement(this.$refs.wrapper,
                this.currentKeyboardNavNode.$el.querySelector('.tree-wholerow'));
        },
        // TODO: move to webapps-common as util - refactor MultiSelectListBox and ListBox (scrollToCurrent)
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
  <div
    class="tree"
    role="tree"
    ref="wrapper"
    @mousemove="onMouseMove"
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
      />
    </ul>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.tree {
  height: 250px;
  background: var(--knime-white);
  border: 1px solid var(--knime-stone-gray);
  overflow-y: auto;
  user-select: none;

  &:focus {
    outline: none;
    border-color: var(--knime-masala);
  }
}

.tree-container-ul {
  padding: 0;
  margin: 0 0 0 -5px;
  list-style-type: none;

  /* for ellipsis */
  max-width: calc(100% + 5px);
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
