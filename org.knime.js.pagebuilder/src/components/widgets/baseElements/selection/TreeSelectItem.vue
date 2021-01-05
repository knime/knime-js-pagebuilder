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
        showCheckbox: {
            type: Boolean,
            default: false
        },
        allowTransition: {
            type: Boolean,
            default: true
        },
        height: {
            type: Number,
            default: 24
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
      <i
        v-if="showCheckbox && !model.loading"
        class="tree-icon tree-checkbox"
        role="presentation"
      />
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
        <span>{{ model[textFieldName] }}</span>
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
        :show-checkbox="showCheckbox"
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
