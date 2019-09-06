<script>
import ColumnContent from './ColumnContent';

export default {
    components: {
        ColumnContent
    },
    props: {
        column: {
            default: () => {},
            type: Object
        }
    },
    computed: {
        content() {
            return this.column.content;
        },
        classes() {
            // we don't support responsive layouts yet
            // TODO
            let classes = [
                'col',
                `col-${this.column.widthXS}`
            ];

            if (this.column.additionalClasses) {
                classes.concat(this.column.additionalClasses);
            }
            return classes;
        },
        styles() {
            if (this.column.additionalStyles) {
                return this.column.additionalStyles.join(' ');
            }
            return null;
        }
    }
};
</script>

<template>
  <div :class="classes">
    <ColumnContent
      v-for="(item, index) in content"
      :key="index"
      :item="item"
    />
  </div>
</template>

<style lang="postcss" scoped>

</style>
