<script>
import TreeSelectItem from './TreeSelectItem';

let ITEM_ID = 0;
// eslint-disable-next-line no-magic-numbers
let ITEM_HEIGHT_DEFAULT = 22;

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
        size: {
            type: String,
            default: null,
            validator: value => ['large', 'small'].indexOf(value) > -1
        },
        showCheckbox: {
            type: Boolean,
            default: false
        },
        wholeRow: {
            type: Boolean,
            default: true
        },
        noDots: {
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
        async: { type: Function },
        loadingText: {
            type: String,
            default: 'Loading...'
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
                { 'tree-default': !this.size },
                { 'tree-checkbox-selection': Boolean(this.showCheckbox) },
                { [this.klass]: Boolean(this.klass) }
            ];
        },
        containerClasses() {
            return [
                { 'tree-container-ul': true },
                { 'tree-children': true },
                { 'tree-wholerow-ul': Boolean(this.wholeRow) },
                { 'tree-no-dots': Boolean(this.noDots) }
            ];
        },
        sizeHeight() {
            return ITEM_HEIGHT_DEFAULT;
        }
    },
    created() {
        this.initializeData(this.data);
    },
    mounted() {
        if (this.async) {
            this.$set(this.data, 0, this.initializeLoading());
            this.handleAsyncLoad(this.data, this);
        }
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
        initializeLoading() {
            let item = {};
            item[this.textFieldName] = this.loadingText;
            item.disabled = true;
            item.loading = true;
            return this.initializeDataItem(item);
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
            if (oriNode.model.opened) {
                this.handleAsyncLoad(oriNode.model[this.childrenFieldName], oriNode, oriItem);
            }
            this.$emit('item-toggle', oriNode, oriItem, e);
        },
        handleAsyncLoad(oriParent, oriNode, oriItem) {
            let self = this;
            if (this.async) {
                if (oriParent[0].loading) {
                    this.async(oriNode, (data) => {
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                if (!data[i].isLeaf) {
                                    if (typeof data[i][self.childrenFieldName] !== 'object') {
                                        data[i][self.childrenFieldName] = [self.initializeLoading()];
                                    }
                                }
                                let dataItem = self.initializeDataItem(data[i]);
                                self.$set(oriParent, i, dataItem);
                            }
                        } else {
                            oriNode.model[self.childrenFieldName] = [];
                        }
                    });
                }
            }
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
        :show-checkbox="showCheckbox"
        :allow-transition="allowTransition"
        :height="sizeHeight"
        :parent-item="data"
        :draggable="draggable"
        :drag-over-background-color="dragOverBackgroundColor"
        :on-item-click="onItemClick"
        :on-item-toggle="onItemToggle"
        :on-item-drag-start="onItemDragStart"
        :on-item-drag-end="onItemDragEnd"
        :on-item-drop="onItemDrop"
        :klass="index === data.length-1?'tree-last':''"
      >
        <template slot-scope="_">
          <slot
            :vm="_.vm"
            :model="_.model"
          >
            <span>{{ _.model[textFieldName] }}</span>
          </slot>
        </template>
      </TreeSelectItem>
    </ul>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.tree-wholerow-ul {
  position: relative;
  display: inline-block;
  min-width: 100%;
}

.tree-wholerow-ul .tree-leaf > .tree-ocl {
  cursor: pointer;
}

.tree-wholerow-ul .tree-anchor,
.tree-wholerow-ul .tree-icon {
  position: relative;
}

.tree-wholerow-ul .tree-wholerow {
  width: 100%;
  cursor: pointer;
  z-index: -1;
  position: absolute;
  left: 0;
  user-select: none;
}


/* TreeSelectItem */

.tree-node,
.tree-children,
.tree-container-ul {
  display: block;
  margin: 0;
  padding: 0;
  list-style-type: none;
  list-style-image: none;
}

.tree-children {
  overflow: hidden;
}

.tree-node {
  white-space: nowrap;
}

.tree-anchor {
  display: inline-block;
  color: black;
  white-space: nowrap;
  padding: 0 4px 0 1px;
  margin: 0;
  vertical-align: top;
  font-size: 14px;
  cursor: pointer;
}

.tree-anchor:focus {
  outline: 0;
}

.tree-anchor,
.tree-anchor:link,
.tree-anchor:visited,
.tree-anchor:hover,
.tree-anchor:active {
  text-decoration: none;
  color: inherit;
}

.tree-icon {
  display: inline-block;
  text-decoration: none;
  margin: 0;
  padding: 0;
  vertical-align: top;
  text-align: center;
}

.tree-icon:empty {
  display: inline-block;
  text-decoration: none;
  margin: 0;
  padding: 0;
  vertical-align: top;
  text-align: center;
}

.tree-ocl {
  cursor: pointer;
}

.tree-leaf > .tree-ocl {
  cursor: default;
}

.tree-anchor > .tree-themeicon {
  margin-right: 2px;
}

.tree-no-icons .tree-themeicon,
.tree-anchor > .tree-themeicon-hidden {
  display: none;
}

.tree-hidden,
.tree-node.tree-hidden {
  display: none;
}


/* theme */

.tree-anchor,
.tree-animated,
.tree-wholerow {
  transition: background-color 0.15s, box-shadow 0.15s;
}

.tree-hovered {
  background: #eee;
  border: 0;
  box-shadow: none;
}

.tree-context {
  background: #eee;
  border: 0;
  box-shadow: none;
}

.tree-selected {
  background: #e1e1e1;
  border: 0;
  box-shadow: none;
}

.tree-no-icons .tree-anchor > .tree-themeicon {
  display: none;
}

.tree-disabled {
  background: transparent;
  color: #666666;
}

.tree-disabled.tree-hovered {
  background: transparent;
  box-shadow: none;
}

.tree-disabled.tree-selected {
  background: #efefef;
}

.tree-disabled > .tree-icon {
  opacity: 0.8;
  filter: gray;
}

.tree-search {
  font-style: italic;
  color: #8b0000;
  font-weight: bold;
}

.tree-no-checkboxes .tree-checkbox {
  display: none !important;
}

.tree-default.tree-checkbox-no-clicked .tree-selected {
  background: transparent;
  box-shadow: none;
}

.tree-default.tree-checkbox-no-clicked .tree-selected.tree-hovered {
  background: #eee;
}

.tree-default.tree-checkbox-no-clicked > .tree-wholerow-ul .tree-wholerow-clicked {
  background: transparent;
}

.tree-default.tree-checkbox-no-clicked > .tree-wholerow-ul .tree-wholerow-clicked.tree-wholerow-hovered {
  background: #eee;
}

> .tree-striped {
  min-width: 100%;
  display: inline-block;
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAkCAMAAAB/qqA+AAAABlBMVEUAAAAAAAClZ7nPAAAAAnRSTlMNAMM9s3UAAAAXSURBVHjajcEBAQAAAIKg/H/aCQZ70AUBjAATb6YPDgAAAABJRU5ErkJggg==") left top repeat;
}

> .tree-wholerow-ul .tree-hovered,
> .tree-wholerow-ul .tree-selected {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}

.tree-wholerow-hovered {
  background: #eee;
}

.tree-wholerow-clicked {
  background: #e1e1e1;
}

.tree-node {
  min-height: 22px;
  line-height: 22px;
  margin-left: 30px;
  min-width: 22px;
}

.tree-anchor {
  line-height: 22px;
  height: 22px;
}

.tree-icon {
  width: 22px;
  height: 22px;
  line-height: 22px;
}

.tree-icon:empty {
  width: 22px;
  height: 22px;
  line-height: 22px;
}


.tree-wholerow {
  height: 22px;
}

.tree-last {
  background: transparent;
}

.tree-disabled {
  background: transparent;
}

.tree-disabled.tree-hovered {
  background: transparent;
}

.tree-disabled.tree-selected {
  background: #efefef;
}

.tree-ellipsis {
  overflow: hidden;
}

.tree-ellipsis .tree-anchor {
  width: calc(100% - 29px);
  text-overflow: ellipsis;
  overflow: hidden;
}

.tree-ellipsis.tree-no-icons .tree-anchor {
  width: calc(100% - 5px);
}



</style>
