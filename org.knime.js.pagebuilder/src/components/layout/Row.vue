<script>
import Column from './Column';

export default {
    components: {
        Column
    },
    props: {
        row: {
            default: () => ({}),
            type: Object
        }
    },
    computed: {
        columns() {
            return this.row.columns;
        },
        classes() {
            let classes = ['row'];
            if (Array.isArray(this.row.additionalClasses)) {
                classes = classes.concat(this.row.additionalClasses);
            }
            return classes;
        },
        styles() {
            if (Array.isArray(this.row.additionalStyles)) {
                return this.row.additionalStyles.join('; ').replace(/;;/g, ';');
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
.row {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}
</style>
