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
 * Tree with single. and multi-selection.
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
        wholeRow: {
            type: Boolean,
            default: true
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
        }
    },
    data() {
        return {
            draggedItem: null,
            draggedElm: null
        };
    },
    computed: {
        containerClasses() {
            return [
                'tree-container-ul',
                'tree-children',
                { 'tree-wholerow-ul': Boolean(this.wholeRow) }
            ];
        }
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
        onItemClick(oriNode, oriItem, e) {
            if (e.shiftKey) {
                // TODO: implement shift key - first check behaviour of old impl
                console.log('TreeSelect: shift key press while click', oriNode);
            }
            // TODO: mac (metaKey) might require debouncing
            if (!(this.multiple && (e.ctrlKey || e.metaKey))) {
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
      :class="containerClasses"
      role="group"
    >
      <TreeSelectItem
        v-for="(child, index) in data"
        :key="index"
        :data="child"
        :whole-row="wholeRow"
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
  margin: 0 0 0 -25px;
  list-style-type: none;

  /* for ellipsis */
  max-width: calc(100% + 25px);
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
    cursor: pointer;
    position: absolute;
    left: 0;
    user-select: none;
    margin-left: 25px;
  }
}

</style>
