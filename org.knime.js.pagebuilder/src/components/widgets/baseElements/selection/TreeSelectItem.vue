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
        onItemClick: {
            type: Function,
            default: () => false
        },
        onItemToggle: {
            type: Function,
            default: () => false
        }
    },
    data() {
        return {
            isHover: false,
            model: this.data,
            maxHeight: 0
        };
    },
    computed: {
        isFolder() {
            return this.model.children && this.model.children.length;
        },
        classes() {
            return [
                { 'tree-node': true },
                { 'tree-open': this.model.opened },
                { 'tree-closed': !this.model.opened },
                { 'tree-leaf': !this.isFolder }
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
                { 'tree-wholerow': this.isWholeRow },
                { 'tree-wholerow-clicked': this.model.selected },
                { 'tree-wholerow-hovered': this.isHover }
            ];
        },
        cssVars() {
            // css variables for js -> css
            return {
                '--height': `${this.height}px`
            };
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
                    ? `${Math.ceil(this.model.children.length / 100) * 300}ms`
                    : '',
                'transition-property': this.allowTransition ? 'max-height' : '',
                display: this.allowTransition ? 'block' : this.model.opened ? 'block' : 'none'
            };
        }
    },
    watch: {
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
                if (this.$parent.$options.name === 'TreeSelectItem') {
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
        }
    }
};
</script>

<template>
  <li
    :class="classes"
    :style="cssVars"
    role="treeitem"
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
      @click="handleItemClick"
      @mouseover="isHover = true"
      @mouseout="isHover = false"
    >
      <slot
        :vm="this"
        :model="model"
      >
        <i
          class="tree-icon"
          role="presentation"
        >
          <Component
            :is="isFolder ? 'folderIcon' : 'fileIcon'"
          />
        </i>
        <span :title="model.text">{{ model.text }}</span>
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
        v-for="(child, index) in model.children"
        :key="index"
        :data="child"
        :whole-row="wholeRow"
        :allow-transition="allowTransition"
        :height="height"
        :parent-item="model.children"
        :on-item-click="onItemClick"
        :on-item-toggle="onItemToggle"
      />
    </ul>
  </li>
</template>
<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

/* Tree (FileChooser) */
*.tree-node {
  --theme-tree-background-color: transparent;
  --theme-tree-background-color-focus: var(--knime-silver-sand-semi);
  --theme-tree-background-color-hover: var(--knime-silver-sand-semi);
  --theme-tree-background-color-selected: var(--knime-masala);
  --theme-tree-foreground-color: var(--knime-masala);
  --theme-tree-foreground-color-focus: var(--knime-masala);
  --theme-tree-foreground-color-hover: var(--knime-masala);
  --theme-tree-foreground-color-selected: var(--knime-white);
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
  min-height: var(--height);
  line-height: var(--height, 18px);
  margin-left: 25px;
  min-width: var(--height, 18px);
  white-space: nowrap;
}

.tree-anchor {
  display: inline-block;
  color: var(--theme-tree-foreground-color);
  white-space: nowrap;
  padding: 0 4px 0 1px;
  margin: 0;
  vertical-align: top;
  font-size: 14px;
  cursor: pointer;
  line-height: var(--height, 18px);
  height: var(--height, 18px);
  width: calc(100% - 29px);
  text-overflow: ellipsis;
  overflow: hidden;

  &:link,
  &:visited,
  &:hover,
  &:active {
    text-decoration: none;
    color: inherit;
  }
}

.tree-anchor:focus {
  outline: 0;
}

.tree-icon {
  display: inline-block;
  text-decoration: none;
  vertical-align: top;
  text-align: center;
  width: 14px;
  height: 14px;
  line-height: var(--height, 18px);
  padding: 0;
  margin: 0 2px 0 0;

  & > svg {
    vertical-align: middle;
    stroke: var(--theme-tree-foreground-color);
    stroke-width: calc(32px / 14);
  }
}

.tree-ocl {
  cursor: pointer;
}

.tree-leaf > .tree-ocl {
  cursor: default;
}

.tree-wholerow {
  height: var(--height, 18px);
}

.tree-anchor.tree-hovered {
  background: var(--theme-tree-background-color-hover);
  color: var(--theme-tree-foreground-color-hover);

  & .tree-icon > svg {
    stroke: var(--theme-tree-foreground-color-hover);
  }
}

.tree-wholerow-hovered {
  background: var(--theme-tree-background-color-hover);
  color: var(--theme-tree-foreground-color-hover);
}

.tree-anchor.tree-selected {
  background: var(--theme-tree-background-color-selected);
  color: var(--theme-tree-foreground-color-selected);

  & .tree-icon > svg {
    stroke: var(--theme-tree-foreground-color-selected);
  }
}

.tree-wholerow-clicked {
  background: var(--theme-tree-background-color-selected);
  color: var(--theme-tree-foreground-color-selected);
}

.tree-disabled {
  background: transparent;
  color: var(--theme-tree-foreground-color);
  cursor: default;
  opacity: 0.5;
  pointer-events: none;

  &.tree-hovered {
    background: transparent;
  }
}

</style>
