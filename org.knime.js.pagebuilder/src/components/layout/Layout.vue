<script>
import { mapState } from 'vuex';
import Row from './Row.vue';

/**
 * Layout container for combining multiple views to one page
 *
 * The layout follows the well-known row-column grid structure from Bootstrap 4
 *
 * @example
    +Layout------------------------------------+
    | +Row-----------------------------------+ |
    | | +-------+ +-------+ +-------+        | |
    | | |Column | |Column | |Column |        | |
    | | |       | |       | |       | ...    | |
    | | |       | |       | |       |        | |
    | | +-------+ +-------+ +-------+        | |
    | +--------------------------------------+ |
    |  .                                       |
    |  .                                       |
    |  .                                       |
    |                                          |
    +------------------------------------------+
 */
export default {
    components: {
        Row
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
        ...mapState('pagebuilder', ['isReporting'])
    },
    mounted() {
        if (this.isReporting) {
            // notify store that layout is rendered for report generation
            this.$store.dispatch('pagebuilder/setReportingContent', { nodeId: 'layout' });
        }
    }
};
</script>

<!-- knime-layout is used to extract the structure of the page for the report generation -->
<template>
  <div
    id="knime-layout"
    class="container-fluid"
  >
    <Row
      v-for="(row, index) in layout.rows"
      :key="index"
      :row-config="row"
      class="parent-row"
    />
  </div>
</template>

<style lang="postcss" scoped>
.container-fluid {
  width: 100%;

  &,
  & :deep(*),
  & :deep(*::before),
  & :deep(*::after) {
    box-sizing: border-box;
  }

  & .parent-row.row:not(.headless) {
    /* prevent top level overflow of layout which will cause a small scroll on small screens */
    margin-right: var(--grid-gap-width);
    margin-left: var(--grid-gap-width);
  }
}
</style>
