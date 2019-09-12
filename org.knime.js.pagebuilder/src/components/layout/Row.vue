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
            if (Array.isArray(this.row.additionalClasses)) {
                classes = classes.concat(this.row.additionalClasses);
            }
            return classes;
        },
        styles() {
            if (Array.isArray(this.row.additionalStyles)) {
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
