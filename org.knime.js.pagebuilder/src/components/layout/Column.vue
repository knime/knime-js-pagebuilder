<script>
import NodeView from './NodeView';
import Row from './Row';

const maxGridWidth = 12;

export default {
    components: {
        NodeView,
        Row
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
            let classes = ['col'];

            let sizeClasses = [];
            if (this.column.widthXS > 0 && this.column.widthXS <= maxGridWidth) {
                sizeClasses.push(`col-xs-${this.column.widthXS}`);
            }
            if (this.column.widthSM > 0 && this.column.widthSM <= maxGridWidth) {
                sizeClasses.push(`col-sm-${this.column.widthSM}`);
            }
            if (this.column.widthMD > 0 && this.column.widthMD <= maxGridWidth) {
                sizeClasses.push(`col-md-${this.column.widthMD}`);
            }
            if (this.column.widthLG > 0 && this.column.widthLG <= maxGridWidth) {
                sizeClasses.push(`col-lg-${this.column.widthLG}`);
            }
            if (this.column.widthXL > 0 && this.column.widthXL <= maxGridWidth) {
                sizeClasses.push(`col-xl-${this.column.widthXL}`);
            }
            if (!sizeClasses.length) {
                sizeClasses.push('col-xs-12'); // default if no width defined
            }

            classes = classes.concat(sizeClasses);

            if (Array.isArray(this.column.additionalClasses)) {
                classes = classes.concat(this.column.additionalClasses);
            }
            return classes;
        },
        styles() {
            if (Array.isArray(this.column.additionalStyles)) {
                return this.column.additionalStyles.join(' ');
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
    <template v-for="(item, index) in content">
      <NodeView
        v-if="item.type === 'view'"
        :key="index"
        :view="item"
      />
      <Row
        v-else-if="item.type === 'row'"
        :key="index"
        :row="item"
      />
      <template v-else-if="item.type === 'nestedLayout'">
        <Row
          v-for="(row, indexRow) in item.layout.rows"
          :key="indexRow"
          :row="row"
        />
      </template>
      <div
        v-else-if="item.type === 'html'"
        :key="index"
        v-html="item.value"
      />
    </template>
  </div>
</template>
