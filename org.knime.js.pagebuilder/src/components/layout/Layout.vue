<script>
import Row from './Row';

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
        containsUIExtension() {
            const nodeViews = this.$store.state.pagebuilder.page.wizardPageContent?.nodeViews;
            const hasDialog = nodeViews?.hasOwnProperty('DIALOG');
            const hasSingleView = nodeViews?.hasOwnProperty('SINGLE');
            return hasDialog || hasSingleView;
        }
    }
};
</script>

<template>
  <div class="container-fluid">
    <Row
      v-for="(row, index) in layout.rows"
      :key="index"
      :row-config="row"
      :class="containsUIExtension ? null : 'parent-row'"
    />
  </div>
</template>

<style lang="postcss" scoped>
.container-fluid {
  width: 100%;

  &,
  & >>> *,
  & >>> *::before,
  & >>> *::after {
    box-sizing: border-box;
  }

  & .parent-row.row {
    /* prevent top level overflow of layout which will cause a small scroll on small screens */
    margin-right: var(--grid-gap-width);
    margin-left: var(--grid-gap-width);
  }
}
</style>
