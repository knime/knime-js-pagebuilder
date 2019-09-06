<script>
import Column from './Column';

export default {
    components: {
        Column
    },
    props: {
        row: {
            default: () => {},
            type: Object
        }
    },
    computed: {
        columns() {
            return this.row.columns;
        },
        classes() {
            let classes = ['row'];
            if (this.row.additionalClasses) {
                classes.concat(this.row.additionalClasses);
            }
            return classes;
        },
        styles() {
            if (this.row.additionalStyles) {
                return this.row.additionalStyles.join(' ');
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
      :column="column"
    />
  </div>
</template>


<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.row {
  border: 4px solid var(--knime-yellow);
}
</style>
