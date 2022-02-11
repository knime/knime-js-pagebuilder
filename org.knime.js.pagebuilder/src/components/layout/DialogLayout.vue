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
  <div class="row">
    <div
      class="col view-col"
      :style="styles"
    >
      <!-- View -->
      <NodeView
        :view-config="viewContent"
      />
    </div>
    <div
      class="col dialog-col"
      :style="styles"
    >
      <!-- Dialog -->
      <NodeView
        :view-config="dialogContent"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.view-col >>> iframe {
  height: calc(100vh - 10px);
}

.col {
  position: relative;
  width: 100%;
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
  display: flex;
  flex-direction: column;

  & > * {
    flex: 0 0 auto;
  }
}

.dialog-col {
  flex: 0 0 calc(3 * 100% / 12);
  max-width: calc(3 * 100% / 12);
}

.view-col {
  flex: 0 0 calc(9 * 100% / 12);
  max-width: calc(9 * 100% / 12);
}

</style>
