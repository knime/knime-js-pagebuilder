<script>
import itemIcon from 'webapps-common/ui/assets/img/icons/file-question.svg';
import folderIcon from 'webapps-common/ui/assets/img/icons/folder.svg';
import arrowNextIcon from 'webapps-common/ui/assets/img/icons/arrow-next.svg';
import fileIcon from 'webapps-common/ui/assets/img/icons/file-text.svg';

import { icons } from 'webapps-common/ui/util/fileTypeIcons';

const TREE_OPEN_TRANSITION_TIME = 300; // ms

/**
 * This TreeSelectItem component is closely coupled with the TreeSelect component and should not be used in another
 * context. It provides the recursive rendering.
 */
export default {
    // name is required for recursion
    name: 'TreeSelectItem',
    components: {
        itemIcon,
        folderIcon,
        fileIcon,
        arrowNextIcon,
        ...icons
    },
    props: {
        data: {
            type: Object,
            required: true
        },
        allowTransition: {
            type: Boolean,
            default: true
        },
        height: {
            type: Number,
            default: 22
        },
        parentItem: {
            type: Array,
            required: true
        },
        onItemClick: {
            type: Function,
            default: () => false
        },
        onHoverItem: {
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
            isKeyNav: false,
            model: this.data,
            maxHeight: 0
        };
    },
    computed: {
        isFolder() {
            return this.model.children?.length;
        },
        classes() {
            return [
                'tree-node',
                { 'tree-open': this.model.opened },
                { 'tree-closed': !this.model.opened },
                { 'tree-leaf': !this.isFolder }
            ];
        },
        anchorClasses() {
            return [
                'tree-anchor',
                { 'tree-disabled': this.model.disabled },
                { 'tree-selected': this.model.selected },
                { 'tree-hovered': this.isHover || this.isKeyNav }
            ];
        },
        wholeRowClasses() {
            return [
                { 'tree-wholerow': this.isWholeRow },
                { 'tree-wholerow-selected': this.model.selected },
                { 'tree-wholerow-hovered': this.isHover || this.isKeyNav }
            ];
        },
        treeOclClasses() {
            return [
                'tree-icon',
                'tree-ocl',
                { 'tree-ocl-selected': this.model.selected },
                { 'tree-ocl-hovered': this.isHover || this.isKeyNav }
            ];
        },
        cssVars() {
            // css variables for js -> css
            return {
                '--height': `${this.height}px`
            };
        },
        isWholeRow() {
            if (typeof this.$parent.model === 'undefined') {
                return true;
            } else {
                return this.$parent.model.opened === true;
            }
        },
        groupStyle() {
            return {
                position: this.model.opened ? '' : 'relative',
                'max-height': this.allowTransition ? `${this.maxHeight}px` : '',
                'transition-duration': this.allowTransition
                    // eslint-disable-next-line no-magic-numbers
                    ? `${Math.ceil(this.model.children.length / 100) * TREE_OPEN_TRANSITION_TIME}ms`
                    : '',
                'transition-property': this.allowTransition ? 'max-height' : '',
                display: this.allowTransition || this.model.opened ? 'block' : 'none'
            };
        },
        icon() {
            if (this.model.icon) {
                if (this.model.selected && this.model.selectedIcon) {
                    return this.model.selectedIcon;
                }
                return this.model.icon;
            } else {
                // default icons
                return this.isFolder ? folderIcon : itemIcon;
            }
        }
    },
    watch: {
        data(newValue) {
            this.model = newValue;
        },
        'model.opened': {
            handler() {
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
        handleItemToggle() {
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
                    length = this.$refs.children.length;
                    for (let children of this.$refs.children) {
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
            this.onItemClick(this, this.model, e);
        },
        handleMouseOver(e) {
            this.isHover = true;
            this.onHoverItem(this, this.model, e);
        },
        handleMouseOut() {
            this.isHover = false;
        }
    }
};
</script>

<template>
  <li
    :class="classes"
    :style="cssVars"
    role="treeitem"
    :aria-expanded="isFolder ? String(Boolean(model.opened)) : null"
  >
    <div
      v-if="isWholeRow"
      role="presentation"
      :class="wholeRowClasses"
    >
      &nbsp;
    </div>
    <i
      :class="treeOclClasses"
      role="presentation"
      @click="handleItemToggle"
    >
      <arrowNextIcon v-if="isFolder" />
    </i>
    <div
      :class="anchorClasses"
      @click="handleItemClick"
      @dblclick="handleItemToggle"
      @mouseover="handleMouseOver"
      @mouseout="handleMouseOut"
    >
      <i
        class="tree-icon"
        role="presentation"
      >
        <Component :is="icon" />
      </i>
      <span :title="model.text">{{ model.text }}</span>
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
        ref="children"
        :data="child"
        :allow-transition="allowTransition"
        :height="height"
        :parent-item="model.children"
        :on-item-click="onItemClick"
        :on-item-toggle="onItemToggle"
        :on-hover-item="onHoverItem"
      />
    </ul>
  </li>
</template>

<style lang="postcss" scoped>
/* THEME TreeSelect and TreeSelectItem (used by FileChooser) */
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
.tree-children {
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
  line-height: var(--height, 22px);
  margin-left: 15px; /* indent per level */
  min-width: var(--height, 22px);
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
  line-height: var(--height, 22px);
  height: var(--height, 22px);
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

.tree-icon {
  display: inline-block;
  text-decoration: none;
  vertical-align: middle;
  text-align: center;
  width: 14px;
  height: 14px;
  line-height: var(--height, 22px);
  padding: 0;
  margin: 0 2px 3px 0;

  & > svg {
    vertical-align: top;
    stroke: var(--theme-tree-foreground-color);
    stroke-width: calc(32px / 14);
  }

  /* open/close icon */
  &.tree-ocl {
    width: 10px;
    height: 10px;
    cursor: pointer;

    & > svg {
      transition: transform 0.2s ease-in-out;
    }
  }
}

/* arrow (open/close) selected */
.tree-ocl-selected.tree-icon,
  /* file or folder icon selected */
.tree-anchor.tree-selected .tree-icon {
  & > svg {
    stroke: var(--theme-tree-foreground-color-selected);
  }
}

.tree-open > .tree-icon.tree-ocl {
  & > svg {
    transform: rotate(90deg);
  }
}

.tree-leaf > .tree-ocl {
  cursor: default;
}

.tree-wholerow {
  height: var(--height, 22px);
}

/* arrow (open/close) hover */
.tree-ocl-hovered.tree-icon:not(.tree-ocl-selected),
/* file or folder icon hover */
.tree-anchor.tree-hovered:not(.tree-selected) .tree-icon {
  & > svg {
    stroke: var(--theme-tree-foreground-color-hover);
  }
}

.tree-wholerow-selected.tree-wholerow-hovered::before {
  content: "";
  background: var(--theme-tree-background-color-hover);
  width: 5px;
  height: var(--height, 22px);
  display: inline-block;
}

.tree-anchor.tree-hovered {
  color: var(--theme-tree-foreground-color-hover);
}

.tree-anchor.tree-selected {
  color: var(--theme-tree-foreground-color-selected);
}

.tree-wholerow-hovered {
  background: var(--theme-tree-background-color-hover);
}

.tree-wholerow-selected {
  background: var(--theme-tree-background-color-selected);
}

.tree-disabled > i {
  background: transparent;
  color: var(--theme-tree-foreground-color);
  opacity: 0.2;
}

.tree-leaf > .tree-disabled {
  cursor: default;
}
</style>
