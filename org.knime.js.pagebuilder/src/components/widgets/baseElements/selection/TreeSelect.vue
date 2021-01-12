<script>
import TreeSelectItem from './TreeSelectItem';

let ITEM_ID = 0;
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
        collapse: {
            type: Boolean,
            default: false
        },
        multiple: {
            type: Boolean,
            default: false
        },
        allowBatch: {
            type: Boolean,
            default: false
        },
        allowTransition: {
            type: Boolean,
            default: true
        },
        textFieldName: {
            type: String,
            default: 'text'
        },
        valueFieldName: {
            type: String,
            default: 'value'
        },
        childrenFieldName: {
            type: String,
            default: 'children'
        },
        itemEvents: {
            type: Object,
            default() {
                return {};
            }
        },
        itemHeight: {
            type: Number,
            default: 18
        },
        draggable: {
            type: Boolean,
            default: false
        },
        dragOverBackgroundColor: {
            type: String,
            default: '#C9FDC9'
        },
        klass: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            draggedItem: null,
            draggedElm: null
        };
    },
    computed: {
        classes() {
            return [
                { tree: true },
                { [this.klass]: Boolean(this.klass) }
            ];
        },
        containerClasses() {
            return [
                { 'tree-container-ul': true },
                { 'tree-children': true },
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
                    items[i] = this.initializeDataItem(items[i]);
                    this.initializeData(items[i][this.childrenFieldName]);
                }
            }
        },
        initializeDataItem(item) {

            class Model {
                constructor(item, textFieldName, valueFieldName, childrenFieldName, collapse) {
                    this.id = item.id || ITEM_ID++;
                    this[textFieldName] = item[textFieldName] || '';
                    this[valueFieldName] = item[valueFieldName] || item[textFieldName];
                    this.icon = item.icon || '';
                    this.opened = item.opened || collapse;
                    this.selected = item.selected || false;
                    this.disabled = item.disabled || false;
                    this.loading = item.loading || false;
                    if (item.userData) { this.userData = item.userData; }
                    this[childrenFieldName] = item[childrenFieldName] || [];
                }
            }

            let node = Object.assign(
                new Model(item, this.textFieldName, this.valueFieldName, this.childrenFieldName, this.collapse),
                item
            );
            let self = this;
            node.addBefore = (data, selectedNode) => {
                let newItem = self.initializeDataItem(data);
                let index = selectedNode.parentItem.findIndex(t => t.id === node.id);
                selectedNode.parentItem.splice(index, 0, newItem);
            };
            node.addAfter = (data, selectedNode) => {
                let newItem = self.initializeDataItem(data);
                let index = selectedNode.parentItem.findIndex(t => t.id === node.id) + 1;
                selectedNode.parentItem.splice(index, 0, newItem);
            };
            node.addChild = data => {
                let newItem = self.initializeDataItem(data);
                node.opened = true;
                node[self.childrenFieldName].push(newItem);
            };
            node.openChildren = () => {
                node.opened = true;
                self.handleRecursionNodeChildren(node, node => {
                    node.opened = true;
                });
            };
            node.closeChildren = () => {
                node.opened = false;
                self.handleRecursionNodeChildren(node, node => {
                    node.opened = false;
                });
            };
            return node;
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
        handleRecursionNodeChildren(node, func) {
            if (func(node) !== false) {
                if (node[this.childrenFieldName] && node[this.childrenFieldName].length > 0) {
                    for (let childNode of node[this.childrenFieldName]) {
                        this.handleRecursionNodeChildren(childNode, func);
                    }
                }
            }
        },
        onItemClick(oriNode, oriItem, e) {
            if (this.multiple) {
                if (this.allowBatch) {
                    this.handleBatchSelectItems(oriNode, oriItem);
                }
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
        handleBatchSelectItems(oriNode, oriItem) {
            this.handleRecursionNodeChilds(oriNode, node => {
                if (node.model.disabled) {
                    return;
                }
                node.model.selected = oriNode.model.selected;
            });
        },
        onItemToggle(oriNode, oriItem, e) {
            this.$emit('item-toggle', oriNode, oriItem, e);
        },
        onItemDragStart(e, oriNode, oriItem) {
            if (!this.draggable || oriItem.dragDisabled) {
                return false;
            }
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text', null);
            this.draggedElm = e.target;
            this.draggedItem = {
                item: oriItem,
                parentItem: oriNode.parentItem,
                index: oriNode.parentItem.findIndex(t => t.id === oriItem.id)
            };

            this.$emit('item-drag-start', oriNode, oriItem, e);
        },
        onItemDragEnd(e, oriNode, oriItem) {
            this.draggedItem = null;
            this.draggedElm = null;
            this.$emit('item-drag-end', oriNode, oriItem, e);
        },
        onItemDrop(e, oriNode, oriItem) {
            if (!this.draggable || Boolean(oriItem.dropDisabled)) {
                return false;
            }
            this.$emit('item-drop-before', oriNode, oriItem, !this.draggedItem ? null : this.draggedItem.item, e);
            if (!this.draggedElm || this.draggedElm === e.target || this.draggedElm.contains(e.target)) {
                return;
            }
            if (this.draggedItem) {
                if (this.draggedItem.parentItem === oriItem[this.childrenFieldName] ||
                    this.draggedItem.item === oriItem ||
                    (oriItem[this.childrenFieldName] && oriItem[this.childrenFieldName].findIndex(t => t.id === this.draggedItem.item.id) !== -1)) {
                    return;
                }
                if (oriItem[this.childrenFieldName]) {
                    oriItem[this.childrenFieldName].push(this.draggedItem.item);
                } else {
                    oriItem[this.childrenFieldName] = [this.draggedItem.item];
                }
                oriItem.opened = true;
                let draggedItem = this.draggedItem;
                this.$nextTick(() => {
                    draggedItem.parentItem.splice(draggedItem.index, 1);
                });
                this.$emit('item-drop', oriNode, oriItem, draggedItem.item, e);
            }
        }
    }
};
</script>

<template>
  <div
    :class="classes"
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
        :text-field-name="textFieldName"
        :value-field-name="valueFieldName"
        :children-field-name="childrenFieldName"
        :item-events="itemEvents"
        :whole-row="wholeRow"
        :allow-transition="allowTransition"
        :height="itemHeight"
        :parent-item="data"
        :draggable="draggable"
        :drag-over-background-color="dragOverBackgroundColor"
        :on-item-click="onItemClick"
        :on-item-toggle="onItemToggle"
        :on-item-drag-start="onItemDragStart"
        :on-item-drag-end="onItemDragEnd"
        :on-item-drop="onItemDrop"
        :klass="index === data.length-1?'tree-last':''"
      />
    </ul>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

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

  & >>> .tree-leaf > .tree-ocl {
    cursor: pointer;
  }

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
  }
}

</style>
