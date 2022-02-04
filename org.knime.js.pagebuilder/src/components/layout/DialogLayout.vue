<script>
import wrapViewContent from '../../util/wrapViewContent';
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
        content() {
            const rowConfig = this.layout.rows[0];
            const columns = rowConfig.columns;
            return [wrapViewContent(columns[0].content)[0], wrapViewContent(columns[1].content)[0]];
        }
    }
};
</script>

<template>
  <div class="row">
    <div
      class="col col-9"
      :style="styles"
    >
      <NodeView
        :key="'0-' + Date.now()"
        :view-config="content[0]"
      />
    </div>
    <div
      class="col col-3"
      :style="styles"
    >
      <NodeView
        :key="'1-' + Date.now()"
        :view-config="content[1]"
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

.col >>> iframe {
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

.col-3 {
  flex: 0 0 calc(3 * 100% / 12);
  max-width: calc(3 * 100% / 12);
}

.col-9 {
  flex: 0 0 calc(9 * 100% / 12);
  max-width: calc(9 * 100% / 12);
}

</style>
