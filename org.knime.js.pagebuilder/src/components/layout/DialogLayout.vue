<script>
import NodeView from './NodeView';

export default {
    components: {
        NodeView
    },
    props: {
        /**
         * Layout configuration as received from the REST API
         */
        layout: {
            default: () => ({}),
            type: Object,
            validate(rowConfig) {
                if (typeof rowConfig !== 'object') {
                    return false;
                }
                if (!rowConfig.hasOwnProperty('rows')) {
                    return false;
                }
                return true;
            }
        }
    },
    computed: {
        columns() {
            const rowConfig = this.layout.rows[0];
            return rowConfig.columns;
        },
        dialogContent() {
            return this.columns[1].content[0];
        },
        viewContent() {
            return this.columns[0].content[0];
        }
    }
};
</script>

<template>
  <div class="layout">
    <div class="item view">
      <NodeView :view-config="viewContent" />
    </div>
    <div class="item dialog">
      <NodeView :view-config="dialogContent" />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.layout {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.item {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-basis: 0;
  flex-grow: 1;
  flex-direction: column;

  & > * {
    flex: 0 0 auto;
  }
}

.dialog {
  flex: 0 0 calc(3 * 100% / 12);
  max-width: calc(3 * 100% / 12);
}

.view {
  flex: 0 0 calc(9 * 100% / 12);
  max-width: calc(9 * 100% / 12);

  & >>> iframe {
    height: calc(100vh - 10px);
  }
}
</style>
