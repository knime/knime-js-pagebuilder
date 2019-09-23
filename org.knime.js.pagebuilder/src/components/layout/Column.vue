<script>
import NodeView from './NodeView';

const maxGridWidth = 12;

export default {
    components: {
        NodeView,
        // https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components
        Row: () => import('./Row')
    },
    props: {
        column: {
            default: () => ({}),
            type: Object
        }
    },
    computed: {
        content() {
            return this.column.content;
        },
        classes() {

            let classes = [];
            ['XS', 'SM', 'MD', 'LG', 'XL'].forEach(size => {
                const sizeDefinition = this.column[`width${size}`];
                if (sizeDefinition > 0 && sizeDefinition <= maxGridWidth) {
                    classes.push(`col-${size.toLowerCase()}-${sizeDefinition}`);
                }
            });
            if (!classes.length) {
                classes.push('col-xs-12'); // default if no width defined
            }

            if (Array.isArray(this.column.additionalClasses)) {
                classes = classes.concat(this.column.additionalClasses);
            }

            classes.push('col');

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

<style lang="postcss" scoped>
.col {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  -ms-flex-preferred-size: 0;
  flex-basis: 0;
  -ms-flex-positive: 1;
  flex-grow: 1;
  max-width: 100%;
  display: flex;
  flex-direction: column;

  & > * {
    flex: 0 0 auto;
  }

  outline: 1px dashed red;
}

@media (min-width: 576px) {
  .col-sm-1 {
    -ms-flex: 0 0 calc(100% / 12);
    flex: 0 0 calc(100% / 12);
    max-width: calc(100% / 12);
  }

  .col-sm-2 {
    -ms-flex: 0 0 calc(2 * 100% / 12);
    flex: 0 0 calc(2 * 100% / 12);
    max-width: calc(2 * 100% / 12);
  }

  .col-sm-3 {
    -ms-flex: 0 0 calc(3 * 100% / 12);
    flex: 0 0 calc(3 * 100% / 12);
    max-width: calc(3 * 100% / 12);
  }

  .col-sm-4 {
    -ms-flex: 0 0 calc(4 * 100% / 12);
    flex: 0 0 calc(4 * 100% / 12);
    max-width: calc(4 * 100% / 12);
  }

  .col-sm-5 {
    -ms-flex: 0 0 calc(5 * 100% / 12);
    flex: 0 0 calc(5 * 100% / 12);
    max-width: calc(5 * 100% / 12);
  }

  .col-sm-6 {
    -ms-flex: 0 0 calc(6 * 100% / 12);
    flex: 0 0 calc(6 * 100% / 12);
    max-width: calc(6 * 100% / 12);
  }

  .col-sm-7 {
    -ms-flex: 0 0 calc(7 * 100% / 12);
    flex: 0 0 calc(7 * 100% / 12);
    max-width: calc(7 * 100% / 12);
  }

  .col-sm-8 {
    -ms-flex: 0 0 calc(8 * 100% / 12);
    flex: 0 0 calc(8 * 100% / 12);
    max-width: calc(8 * 100% / 12);
  }

  .col-sm-9 {
    -ms-flex: 0 0 calc(9 * 100% / 12);
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-sm-10 {
    -ms-flex: 0 0 calc(9 * 100% / 12);
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-sm-11 {
    -ms-flex: 0 0 calc(11 * 100% / 12);
    flex: 0 0 calc(11 * 100% / 12);
    max-width: calc(11 * 100% / 12);
  }

  .col-sm-12 {
    -ms-flex: 0 0 100%;
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (min-width: 768px) {
  .col-md-1 {
    -ms-flex: 0 0 calc(100% / 12);
    flex: 0 0 calc(100% / 12);
    max-width: calc(100% / 12);
  }

  .col-md-2 {
    -ms-flex: 0 0 calc(2 * 100% / 12);
    flex: 0 0 calc(2 * 100% / 12);
    max-width: calc(2 * 100% / 12);
  }

  .col-md-3 {
    -ms-flex: 0 0 calc(3 * 100% / 12);
    flex: 0 0 calc(3 * 100% / 12);
    max-width: calc(3 * 100% / 12);
  }

  .col-md-4 {
    -ms-flex: 0 0 calc(4 * 100% / 12);
    flex: 0 0 calc(4 * 100% / 12);
    max-width: calc(4 * 100% / 12);
  }

  .col-md-5 {
    -ms-flex: 0 0 calc(5 * 100% / 12);
    flex: 0 0 calc(5 * 100% / 12);
    max-width: calc(5 * 100% / 12);
  }

  .col-md-6 {
    -ms-flex: 0 0 calc(6 * 100% / 12);
    flex: 0 0 calc(6 * 100% / 12);
    max-width: calc(6 * 100% / 12);
  }

  .col-md-7 {
    -ms-flex: 0 0 calc(7 * 100% / 12);
    flex: 0 0 calc(7 * 100% / 12);
    max-width: calc(7 * 100% / 12);
  }

  .col-md-8 {
    -ms-flex: 0 0 calc(8 * 100% / 12);
    flex: 0 0 calc(8 * 100% / 12);
    max-width: calc(8 * 100% / 12);
  }

  .col-md-9 {
    -ms-flex: 0 0 calc(9 * 100% / 12);
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-md-10 {
    -ms-flex: 0 0 calc(9 * 100% / 12);
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-md-11 {
    -ms-flex: 0 0 calc(11 * 100% / 12);
    flex: 0 0 calc(11 * 100% / 12);
    max-width: calc(11 * 100% / 12);
  }

  .col-md-12 {
    -ms-flex: 0 0 100%;
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (min-width: 992px) {
  .col-lg-1 {
    -ms-flex: 0 0 calc(100% / 12);
    flex: 0 0 calc(100% / 12);
    max-width: calc(100% / 12);
  }

  .col-lg-2 {
    -ms-flex: 0 0 calc(2 * 100% / 12);
    flex: 0 0 calc(2 * 100% / 12);
    max-width: calc(2 * 100% / 12);
  }

  .col-lg-3 {
    -ms-flex: 0 0 calc(3 * 100% / 12);
    flex: 0 0 calc(3 * 100% / 12);
    max-width: calc(3 * 100% / 12);
  }

  .col-lg-4 {
    -ms-flex: 0 0 calc(4 * 100% / 12);
    flex: 0 0 calc(4 * 100% / 12);
    max-width: calc(4 * 100% / 12);
  }

  .col-lg-5 {
    -ms-flex: 0 0 calc(5 * 100% / 12);
    flex: 0 0 calc(5 * 100% / 12);
    max-width: calc(5 * 100% / 12);
  }

  .col-lg-6 {
    -ms-flex: 0 0 calc(6 * 100% / 12);
    flex: 0 0 calc(6 * 100% / 12);
    max-width: calc(6 * 100% / 12);
  }

  .col-lg-7 {
    -ms-flex: 0 0 calc(7 * 100% / 12);
    flex: 0 0 calc(7 * 100% / 12);
    max-width: calc(7 * 100% / 12);
  }

  .col-lg-8 {
    -ms-flex: 0 0 calc(8 * 100% / 12);
    flex: 0 0 calc(8 * 100% / 12);
    max-width: calc(8 * 100% / 12);
  }

  .col-lg-9 {
    -ms-flex: 0 0 calc(9 * 100% / 12);
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-lg-10 {
    -ms-flex: 0 0 calc(9 * 100% / 12);
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-lg-11 {
    -ms-flex: 0 0 calc(11 * 100% / 12);
    flex: 0 0 calc(11 * 100% / 12);
    max-width: calc(11 * 100% / 12);
  }

  .col-lg-12 {
    -ms-flex: 0 0 100%;
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (min-width: 1200px) {
  .col-xl-1 {
    -ms-flex: 0 0 calc(100% / 12);
    flex: 0 0 calc(100% / 12);
    max-width: calc(100% / 12);
  }

  .col-xl-2 {
    -ms-flex: 0 0 calc(2 * 100% / 12);
    flex: 0 0 calc(2 * 100% / 12);
    max-width: calc(2 * 100% / 12);
  }

  .col-xl-3 {
    -ms-flex: 0 0 calc(3 * 100% / 12);
    flex: 0 0 calc(3 * 100% / 12);
    max-width: calc(3 * 100% / 12);
  }

  .col-xl-4 {
    -ms-flex: 0 0 calc(4 * 100% / 12);
    flex: 0 0 calc(4 * 100% / 12);
    max-width: calc(4 * 100% / 12);
  }

  .col-xl-5 {
    -ms-flex: 0 0 calc(5 * 100% / 12);
    flex: 0 0 calc(5 * 100% / 12);
    max-width: calc(5 * 100% / 12);
  }

  .col-xl-6 {
    -ms-flex: 0 0 calc(6 * 100% / 12);
    flex: 0 0 calc(6 * 100% / 12);
    max-width: calc(6 * 100% / 12);
  }

  .col-xl-7 {
    -ms-flex: 0 0 calc(7 * 100% / 12);
    flex: 0 0 calc(7 * 100% / 12);
    max-width: calc(7 * 100% / 12);
  }

  .col-xl-8 {
    -ms-flex: 0 0 calc(8 * 100% / 12);
    flex: 0 0 calc(8 * 100% / 12);
    max-width: calc(8 * 100% / 12);
  }

  .col-xl-9 {
    -ms-flex: 0 0 calc(9 * 100% / 12);
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-xl-10 {
    -ms-flex: 0 0 calc(9 * 100% / 12);
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-xl-11 {
    -ms-flex: 0 0 calc(11 * 100% / 12);
    flex: 0 0 calc(11 * 100% / 12);
    max-width: calc(11 * 100% / 12);
  }

  .col-xl-12 {
    -ms-flex: 0 0 100%;
    flex: 0 0 100%;
    max-width: 100%;
  }
}

</style>
