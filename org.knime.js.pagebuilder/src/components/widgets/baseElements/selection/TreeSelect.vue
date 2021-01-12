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
        :on-item-click="onItemClick"
        :on-item-toggle="onItemToggle"
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
