<script>
import Column from './Column';

/**
 * Row container (part of a page layout)
 */
export default {
    components: {
        Column
    },
    props: {
        /**
         * Row configuration as received from the REST API
         */
        rowConfig: {
            default: () => ({}),
            type: Object,
            validate(rowConfig) {
                if (typeof rowConfig !== 'object') {
                    return false;
                }
                if (!rowConfig.hasOwnProperty('columns')) {
                    return false;
                }
                return true;
            }
        }
    },
    computed: {
        columns() {
            return this.rowConfig.columns;
        },
        classes() {
            let classes = ['row'];
            if (Array.isArray(this.rowConfig.additionalClasses)) {
                classes = classes.concat(this.rowConfig.additionalClasses);
            }
            return classes;
        },
        styles() {
            if (Array.isArray(this.rowConfig.additionalStyles)) {
                return this.rowConfig.additionalStyles.join('; ').replace(/;;/g, ';');
            }
            return null;
        }
    }
};
</script>

<template>
  <div
    :class="classes"
    :style="styles"
  >
    <Column
      v-for="(column, index) in columns"
      :key="index"
      :column-config="column"
    />
  </div>
</template>

<style lang="postcss" scoped>
.row {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

@media only screen and (max-width: 900px) {
  .row {
    margin-right: 0;
    margin-left: 0;
  }
}

</style>
