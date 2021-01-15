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
            lastClickedNode: null
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
                        this.handleSingleSelectItems(oriNode, oriItem);
                    }
                } else if (e.ctrlKey || e.metaKey) {
                    // TODO: mac (metaKey) might require debouncing
                    oriNode.model.selected = !oriNode.model.selected;
                } else {
                    this.handleSingleSelectItems(oriNode, oriItem);
                }
                // remember node for shift actions
                this.lastClickedNode = oriNode;
            } else {
                this.handleSingleSelectItems(oriNode, oriItem);
            }
            this.$emit('item-click', oriNode, oriItem, e);
        },
        handleSingleSelectItems(oriNode, oriItem) {
            this.handleRecursionNodeChilds(this, node => {
                if (node.model) {
                    node.model.selected = false;
                }
            });
            oriNode.model.selected = true;
        },
        onItemToggle(oriNode, oriItem, e) {
            this.$emit('item-toggle', oriNode, oriItem, e);
        }
    }
};
</script>

<template>
  <div
    class="tree"
    role="tree"
  >
    <ul
      :aria-label="ariaLabel"
      class="tree-container-ul tree-children tree-wholerow-ul"
      role="group"
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
  user-select: none;
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
