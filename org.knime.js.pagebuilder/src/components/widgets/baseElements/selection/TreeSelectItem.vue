<script>
import fileIcon from '~/webapps-common/ui/assets/img/icons/file-question.svg?inline';
import folderIcon from '~/webapps-common/ui/assets/img/icons/folder.svg?inline';
import arrowDownIcon from '~/webapps-common/ui/assets/img/icons/arrow-dropdown.svg?inline';
import arrowLeftIcon from '~/webapps-common/ui/assets/img/icons/arrow-next.svg?inline';

export default {
    // name is required for recursion
    name: 'TreeSelectItem',
    components: {
        fileIcon,
        folderIcon,
        arrowDownIcon,
        arrowLeftIcon
    },
    props: {
        data: {
            type: Object,
            required: true
        },
        textFieldName: {
            type: String,
            required: true
        },
        valueFieldName: {
            type: String,
            required: true
        },
        childrenFieldName: {
            type: String,
            required: true
        },
        itemEvents: {
            type: Object,
            required: true
        },
        wholeRow: {
            type: Boolean,
            default: false
        },
        allowTransition: {
            type: Boolean,
            default: true
        },
        height: {
            type: Number,
            default: 18
        },
        parentItem: {
            type: Array,
            required: true
        },
        draggable: {
            type: Boolean,
            default: false
        },
        dragOverBackgroundColor: {
            type: String,
            required: true
        },
        onItemClick: {
            type: Function,
            default: () => false
        },
        onItemToggle: {
            type: Function,
            default: () => false
        },
        onItemDragStart: {
            type: Function,
            default: () => false
        },
        onItemDragEnd: {
            type: Function,
            default: () => false
        },
        onItemDrop: {
            type: Function,
            default: () => false
        },
        klass: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            isHover: false,
            isDragEnter: false,
            model: this.data,
            maxHeight: 0,
            events: {}
        };
    },
    computed: {
        isFolder() {
            return this.model[this.childrenFieldName] && this.model[this.childrenFieldName].length;
        },
        classes() {
            return [
                { 'tree-node': true },
                { 'tree-open': this.model.opened },
                { 'tree-closed': !this.model.opened },
                { 'tree-leaf': !this.isFolder },
                { 'tree-loading': Boolean(this.model.loading) },
                { 'tree-drag-enter': this.isDragEnter },
                { [this.klass]: Boolean(this.klass) }
            ];
        },
        anchorClasses() {
            return [
                { 'tree-anchor': true },
                { 'tree-disabled': this.model.disabled },
                { 'tree-selected': this.model.selected },
                { 'tree-hovered': this.isHover }
            ];
        },
        wholeRowClasses() {
            return [
                { 'tree-wholerow': true },
                { 'tree-wholerow-clicked': this.model.selected },
                { 'tree-wholerow-hovered': this.isHover }
            ];
        },
        isWholeRow() {
            if (this.wholeRow) {
                // eslint-disable-next-line no-undefined
                if (this.$parent.model === undefined) {
                    return true;
                } else {
                    return this.$parent.model.opened === true;
                }
            }
            return false;
        },
        groupStyle() {
            return {
                position: this.model.opened ? '' : 'relative',
                'max-height': this.allowTransition ? `${this.maxHeight}px` : '',
                // eslint-disable-next-line no-magic-numbers
                'transition-duration': this.allowTransition
                    ? `${Math.ceil(this.model[this.childrenFieldName].length / 100) * 300}ms`
                    : '',
                'transition-property': this.allowTransition ? 'max-height' : '',
                display: this.allowTransition ? 'block' : this.model.opened ? 'block' : 'none'
            };
        }
    },
    watch: {
        isDragEnter(newValue) {
            if (newValue) {
                this.$el.style.backgroundColor = this.dragOverBackgroundColor;
            } else {
                this.$el.style.backgroundColor = 'inherit';
            }
        },
        data(newValue) {
            this.model = newValue;
        },
        'model.opened': {
            handler(val, oldVal) {
                this.onItemToggle(this, this.model);
                this.handleGroupMaxHeight();
            },
            deep: true
        }
    },
    created() {
        const self = this;
        const events = {
            click: this.handleItemClick,
            mouseover: this.handleItemMouseOver,
            mouseout: this.handleItemMouseOut
        };
        for (let itemEvent in this.itemEvents) {
            let itemEventCallback = this.itemEvents[itemEvent];
            if (events.hasOwnProperty(itemEvent)) {
                let eventCallback = events[itemEvent];
                events[itemEvent] = function (event) {
                    eventCallback(self, self.model, event);
                    itemEventCallback(self, self.model, event);
                };
            } else {
                events[itemEvent] = function (event) {
                    itemEventCallback(self, self.model, event);
                };
            }
        }
        this.events = events;
    },
    mounted() {
        this.handleGroupMaxHeight();
    },
    methods: {
        handleItemToggle(e) {
            if (this.isFolder) {
                this.model.opened = !this.model.opened;
                this.onItemToggle(this, this.model);
            }
        },
        handleGroupMaxHeight() {
            if (this.allowTransition) {
                let length = 0;
                let childHeight = 0;
                if (this.model.opened) {
                    length = this.$children.length;
                    for (let children of this.$children) {
                        childHeight += children.maxHeight;
                    }
                }
                this.maxHeight = length * this.height + childHeight;
                if (this.$parent.$options._componentTag === 'tree-item') {
                    this.$parent.handleGroupMaxHeight();
                }
            }
        },
        handleItemClick(e) {
            if (this.model.disabled) {
                return;
            }
            this.model.selected = !this.model.selected;
            this.onItemClick(this, this.model, e);
        },
        handleItemMouseOver() {
            this.isHover = true;
        },
        handleItemMouseOut() {
            this.isHover = false;
        },
        handleItemDrop(e, oriNode, oriItem) {
            this.$el.style.backgroundColor = 'inherit';
            this.onItemDrop(e, oriNode, oriItem);
        }
    }
};
</script>

<template>
  <li
    :class="classes"
    :draggable="draggable"
    role="treeitem"
    @dragstart.stop="onItemDragStart($event, _self, _self.model)"
    @dragend.stop.prevent="onItemDragEnd($event, _self, _self.model)"
    @dragover.stop.prevent="isDragEnter = true"
    @dragenter.stop.prevent="isDragEnter = true"
    @dragleave.stop.prevent="isDragEnter = false"
    @drop.stop.prevent="handleItemDrop($event, _self, _self.model)"
  >
    <div
      v-if="isWholeRow"
      role="presentation"
      :class="wholeRowClasses"
    >
      &nbsp;
    </div>
    <i
      class="tree-icon tree-ocl"
      role="presentation"
      @click="handleItemToggle"
    >
      <Component
        :is="model.opened ? 'arrowDownIcon' : 'arrowLeftIcon'"
        v-if="isFolder"
      />
    </i>
    <div
      :class="anchorClasses"
      v-on="events"
    >
      <slot
        :vm="this"
        :model="model"
      >
        <i
          class="tree-icon tree-themeicon"
          role="presentation"
        >
          <Component
            :is="isFolder ? 'folderIcon' : 'fileIcon'"
          />
        </i>
        <span :title="model[textFieldName]">{{ model[textFieldName] }}</span>
      </slot>
    </div>
    <ul
      v-if="isFolder"
      ref="group"
      role="group"
      class="tree-children"
      :style="groupStyle"
    >
      <TreeSelectItem
        v-for="(child, index) in model[childrenFieldName]"
        :key="index"
        :data="child"
        :text-field-name="textFieldName"
        :value-field-name="valueFieldName"
        :children-field-name="childrenFieldName"
        :item-events="itemEvents"
        :whole-row="wholeRow"
        :allow-transition="allowTransition"
        :height="height"
        :parent-item="model[childrenFieldName]"
        :draggable="draggable"
        :drag-over-background-color="dragOverBackgroundColor"
        :on-item-click="onItemClick"
        :on-item-toggle="onItemToggle"
        :on-item-drag-start="onItemDragStart"
        :on-item-drag-end="onItemDragEnd"
        :on-item-drop="onItemDrop"
        :klass="index === model[childrenFieldName].length-1?'tree-last':''"
      />
    </ul>
  </li>
</template>
<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

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

.tree-hovered,
.tree-selected {
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
  min-height: 18px;
  line-height: 18px;
  margin-left: 25px;
  min-width: 18px;
}

.tree-anchor {
  line-height: 18px;
  height: 18px;
}

.tree-icon {
  width: 14px;
  height: 14px;
  line-height: 18px;
  padding-top: 2px;
}

.tree-icon:empty {
  width: 14px;
  height: 14px;
  line-height: 18px;
}

.tree-wholerow {
  height: 18px;
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



.tree-anchor {
  width: calc(100% - 29px);
  text-overflow: ellipsis;
  overflow: hidden;
}

</style>
