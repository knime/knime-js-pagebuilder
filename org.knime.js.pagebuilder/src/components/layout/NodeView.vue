<script>
import NodeViewIFrame from './NodeViewIFrame';

export default {
    components: {
        NodeViewIFrame
    },
    props: {
        view: {
            default: () => [],
            type: Object
        }
    },
    computed: {
        webNode() {
            return this.$store.state.pagebuilder.page.webNodes[this.view.nodeID];
        },
        resizeClass() {
            if (!this.view.resizeMethod) {
                return null;
            }
            return this.view.resizeMethod;
        },
        style() {
            const styleProps = ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'];

            // extract style props
            const style = {};
            styleProps.forEach(prop => {
                if (this.view.hasOwnProperty(prop)) {
                    let value = this.view[prop];
                    if (value) {
                        if (!value.toString().includes('px')) {
                            value = `${value}px`;
                        }
                        style[prop] = value;
                    }
                }
            });
            return style;
        }
    }
};
</script>

<template>
  <div
    :class="['view', resizeClass, 'd-flex align-items-center']"
    :style="style"
  >
    <NodeViewIFrame :web-node="webNode" />
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.view {
  background-color: var(--theme-color-11);

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
