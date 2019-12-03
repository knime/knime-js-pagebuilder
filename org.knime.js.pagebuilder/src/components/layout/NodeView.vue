<script>
import NodeViewIFrame from './NodeViewIFrame';
import Widget from '../widgets/Widget';
import { classToComponentMap } from '../widgets/widgets.config';

/**
 * Wrapper for a single node view iframe or widget
 */
export default {
    components: {
        NodeViewIFrame,
        Widget
    },
    props: {
        /**
         * View configuration as received from the REST API
         */
        viewConfig: {
            default: () => ({}),
            type: Object,
            validate(viewConfig) {
                if (typeof viewConfig !== 'object') {
                    return false;
                }
                if (!viewConfig.hasOwnProperty('nodeID')) {
                    return false;
                }
                return true;
            }
        }
    },
    data() {
        return {
            height: null
        };
    },
    computed: {
        autoHeight() {
            // legacy implementation used the prefix `view` for various resizing detection methods.
            // The current implementation uses only one method, so the only information needed is whether or not to use
            // resizing detection at all
            return this.viewConfig.resizeMethod && this.viewConfig.resizeMethod.startsWith('view');
        },
        pollHeight() {
            return this.viewConfig.autoResize !== false;
        },
        webNodeConfig() {
            let nodeConfigs = this.$store.state.pagebuilder.page.wizardPageContent.webNodes;
            let { nodeID } = this.viewConfig;
            return nodeConfigs[nodeID];
        },
        webNodeAvailable() {
            // if the user removes a node that has already been part of a layout, then KNIME Analytics Platform does not
            // update the layout configuration, so we get a phantom item
            return typeof this.webNodeConfig !== 'undefined';
        },
        classes() {
            let classes = ['view'];
            if (this.webNodeAvailable && this.viewConfig.resizeMethod &&
                this.viewConfig.resizeMethod.startsWith('aspectRatio')) {
                classes.push(this.viewConfig.resizeMethod);
                if (Array.isArray(this.viewConfig.additionalClasses)) {
                    classes = classes.concat(this.viewConfig.additionalClasses);
                }
            }
            return classes;
        },
        style() {
            let style = [];

            if (this.webNodeAvailable) {
                const styleProps = ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'];
                styleProps.forEach(prop => {
                    if (this.viewConfig.hasOwnProperty(prop)) {
                        let value = this.viewConfig[prop];
                        if (value) {
                            let key = prop.replace(/[WH]/, x => `-${x.toLowerCase()}`);
                            if (!value.toString().includes('px')) {
                                value = `${value}px`;
                            }
                            style.push(`${key}:${value};`);
                        }
                    }
                });
                if (this.viewConfig.additionalStyles) {
                    style = style.concat(this.viewConfig.additionalStyles);
                }
            }

            if (this.height !== null) {
                style.push(`height:${this.height}px;`);
            }

            return style.join(';');
        },
        isWidget() {
            return this.webNodeConfig && this.webNodeConfig.viewRepresentation &&
                classToComponentMap[this.webNodeConfig.viewRepresentation['@class']];
        }
    },
    methods: {
        updateHeight(height) {
            this.height = height;
        }
    }
};
</script>

<template>
  <div
    :class="classes"
    :style="style"
  >
    <template v-if="webNodeAvailable">
      <Widget
        v-if="isWidget"
        :node-config="webNodeConfig"
        :node-id="viewConfig.nodeID"
      />
      <NodeViewIFrame
        v-else
        :node-id="viewConfig.nodeID"
        :node-config="webNodeConfig"
        :auto-height="autoHeight"
        :poll-height="pollHeight"
        :scrolling="viewConfig.scrolling"
        @heightChange="updateHeight"
      />
    </template>
    <p v-else>
      <!-- TODO AP-12850 -->
      Web Node cannot be displayed.
    </p>
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.view {
  background-color: var(--theme-color-white);

  &.aspectRatio16by9,
  &.aspectRatio4by3,
  &.aspectRatio1by1 {
    position: relative;
    width: 100%;
    height: 0;

    & > :first-child {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
    }
  }

  &.aspectRatio16by9 {
    padding-bottom: calc(100% / (16 / 9));
  }

  &.aspectRatio4by3 {
    padding-bottom: calc(100% / (4 / 3));
  }

  &.aspectRatio1by1 {
    padding-bottom: 100%;
  }
}
</style>
