<script>
import wrapViewContent from '../../util/wrapViewContent';
import NodeView from './NodeView';

const maxGridWidth = 12;

/**
 * Column container (part of a row inside a page layout).
 * It holds one or more items of one of the types
 * - view
 * - html
 * - row (a nested layout translates to multiple rows here)
 *
 * @example
 +-----------------+
 |                 |
 |      html       |
 |                 |
 +-----------------+
 |.-----row-------.|
 ||  |  ...    |  ||
 ||  |         |  ||
 |°---------------°|
 +-----------------+
 |                 |
 |      view       |
 |                 |
 +-----------------+
 |.-----row-------.<-- nestedLayout
 ||  |  ...    |  ||
 ||  |         |  ||
 ||-----row-------||
 ||  |  ...    |  ||
 ||  |         |  ||
 ||---------------||
 ||      ⋮        ||
 |°---------------°|
 +-----------------+
 *
 */
export default {
    components: {
        NodeView,
        // https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components
        Row: () => import('./Row')
    },
    props: {
        /**
         * Column configuration as received from the REST API
         */
        columnConfig: {
            default: () => ({}),
            type: Object,
            validate(columnConfig) {
                if (typeof columnConfig !== 'object') {
                    return false;
                }
                if (!columnConfig.hasOwnProperty('content')) {
                    return false;
                }
                return true;
            }
        }
    },
    computed: {
        content() {
            return wrapViewContent(this.columnConfig.content);
        },
        classes() {
            let classes = ['col'];

            let hasSize = false;
            ['XS', 'SM', 'MD', 'LG', 'XL'].forEach((size, i) => {
                const sizeDefinition = this.columnConfig[`width${size}`];
                if (sizeDefinition > 0 && sizeDefinition <= maxGridWidth) {
                    hasSize = true;
                    const modifier = i ? `-${size.toLowerCase()}` : ''; // mobile first: 'XS' is the default
                    classes.push(`col${modifier}-${sizeDefinition}`);
                }
            });

            if (!hasSize) {
                classes.push('col-12'); // default if no width defined
            }

            if (Array.isArray(this.columnConfig.additionalClasses)) {
                classes = classes.concat(this.columnConfig.additionalClasses);
            }

            return classes;
        },
        styles() {
            if (Array.isArray(this.columnConfig.additionalStyles)) {
                return this.columnConfig.additionalStyles.join('; ').replace(/;;/g, ';');
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
      <!-- :key with timestamp to force the IFrame to be re-rendered; TODO WEBP-538 might slow down widgets -->
      <NodeView
        v-if="item.type === 'view' || item.type === 'JSONLayoutViewContent'"
        :key="index + '-' + Date.now()"
        :view-config="item"
      />
      <Row
        v-else-if="item.type === 'row' || item.type === 'JSONLayoutRow'"
        :key="index"
        :row-config="item"
      />
      <template v-else-if="(item.type === 'nestedLayout' || item.type === 'JSONNestedLayout') && item.layout">
        <Row
          v-for="(row, rowIndex) in item.layout.rows"
          :key="index + '-' + rowIndex"
          :row-config="row"
        />
      </template>
      <!-- eslint-disable vue/no-v-html  -->
      <div
        v-else-if="item.type === 'html' || item.type === 'JSONLayoutHTMLContent'"
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
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
  display: flex;
  flex-direction: column;

  & > * {
    flex: 0 0 auto;
  }
}

/* compatible with Bootstrap 4 grid */
.col-1 {
  flex: 0 0 calc(100% / 12);
  max-width: calc(100% / 12);
}

.col-2 {
  flex: 0 0 calc(2 * 100% / 12);
  max-width: calc(2 * 100% / 12);
}

.col-3 {
  flex: 0 0 calc(3 * 100% / 12);
  max-width: calc(3 * 100% / 12);
}

.col-4 {
  flex: 0 0 calc(4 * 100% / 12);
  max-width: calc(4 * 100% / 12);
}

.col-5 {
  flex: 0 0 calc(5 * 100% / 12);
  max-width: calc(5 * 100% / 12);
}

.col-6 {
  flex: 0 0 calc(6 * 100% / 12);
  max-width: calc(6 * 100% / 12);
}

.col-7 {
  flex: 0 0 calc(7 * 100% / 12);
  max-width: calc(7 * 100% / 12);
}

.col-8 {
  flex: 0 0 calc(8 * 100% / 12);
  max-width: calc(8 * 100% / 12);
}

.col-9 {
  flex: 0 0 calc(9 * 100% / 12);
  max-width: calc(9 * 100% / 12);
}

.col-10 {
  flex: 0 0 calc(10 * 100% / 12);
  max-width: calc(10 * 100% / 12);
}

.col-11 {
  flex: 0 0 calc(11 * 100% / 12);
  max-width: calc(11 * 100% / 12);
}

.col-12 {
  flex: 0 0 100%;
  max-width: 100%;
}

@media (min-width: 576px) {
  .col-sm-1 {
    flex: 0 0 calc(100% / 12);
    max-width: calc(100% / 12);
  }

  .col-sm-2 {
    flex: 0 0 calc(2 * 100% / 12);
    max-width: calc(2 * 100% / 12);
  }

  .col-sm-3 {
    flex: 0 0 calc(3 * 100% / 12);
    max-width: calc(3 * 100% / 12);
  }

  .col-sm-4 {
    flex: 0 0 calc(4 * 100% / 12);
    max-width: calc(4 * 100% / 12);
  }

  .col-sm-5 {
    flex: 0 0 calc(5 * 100% / 12);
    max-width: calc(5 * 100% / 12);
  }

  .col-sm-6 {
    flex: 0 0 calc(6 * 100% / 12);
    max-width: calc(6 * 100% / 12);
  }

  .col-sm-7 {
    flex: 0 0 calc(7 * 100% / 12);
    max-width: calc(7 * 100% / 12);
  }

  .col-sm-8 {
    flex: 0 0 calc(8 * 100% / 12);
    max-width: calc(8 * 100% / 12);
  }

  .col-sm-9 {
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-sm-10 {
    flex: 0 0 calc(10 * 100% / 12);
    max-width: calc(10 * 100% / 12);
  }

  .col-sm-11 {
    flex: 0 0 calc(11 * 100% / 12);
    max-width: calc(11 * 100% / 12);
  }

  .col-sm-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (min-width: 768px) {
  .col-md-1 {
    flex: 0 0 calc(100% / 12);
    max-width: calc(100% / 12);
  }

  .col-md-2 {
    flex: 0 0 calc(2 * 100% / 12);
    max-width: calc(2 * 100% / 12);
  }

  .col-md-3 {
    flex: 0 0 calc(3 * 100% / 12);
    max-width: calc(3 * 100% / 12);
  }

  .col-md-4 {
    flex: 0 0 calc(4 * 100% / 12);
    max-width: calc(4 * 100% / 12);
  }

  .col-md-5 {
    flex: 0 0 calc(5 * 100% / 12);
    max-width: calc(5 * 100% / 12);
  }

  .col-md-6 {
    flex: 0 0 calc(6 * 100% / 12);
    max-width: calc(6 * 100% / 12);
  }

  .col-md-7 {
    flex: 0 0 calc(7 * 100% / 12);
    max-width: calc(7 * 100% / 12);
  }

  .col-md-8 {
    flex: 0 0 calc(8 * 100% / 12);
    max-width: calc(8 * 100% / 12);
  }

  .col-md-9 {
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-md-10 {
    flex: 0 0 calc(10 * 100% / 12);
    max-width: calc(10 * 100% / 12);
  }

  .col-md-11 {
    flex: 0 0 calc(11 * 100% / 12);
    max-width: calc(11 * 100% / 12);
  }

  .col-md-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (min-width: 992px) {
  .col-lg-1 {
    flex: 0 0 calc(100% / 12);
    max-width: calc(100% / 12);
  }

  .col-lg-2 {
    flex: 0 0 calc(2 * 100% / 12);
    max-width: calc(2 * 100% / 12);
  }

  .col-lg-3 {
    flex: 0 0 calc(3 * 100% / 12);
    max-width: calc(3 * 100% / 12);
  }

  .col-lg-4 {
    flex: 0 0 calc(4 * 100% / 12);
    max-width: calc(4 * 100% / 12);
  }

  .col-lg-5 {
    flex: 0 0 calc(5 * 100% / 12);
    max-width: calc(5 * 100% / 12);
  }

  .col-lg-6 {
    flex: 0 0 calc(6 * 100% / 12);
    max-width: calc(6 * 100% / 12);
  }

  .col-lg-7 {
    flex: 0 0 calc(7 * 100% / 12);
    max-width: calc(7 * 100% / 12);
  }

  .col-lg-8 {
    flex: 0 0 calc(8 * 100% / 12);
    max-width: calc(8 * 100% / 12);
  }

  .col-lg-9 {
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-lg-10 {
    flex: 0 0 calc(10 * 100% / 12);
    max-width: calc(10 * 100% / 12);
  }

  .col-lg-11 {
    flex: 0 0 calc(11 * 100% / 12);
    max-width: calc(11 * 100% / 12);
  }

  .col-lg-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (min-width: 1200px) {
  .col-xl-1 {
    flex: 0 0 calc(100% / 12);
    max-width: calc(100% / 12);
  }

  .col-xl-2 {
    flex: 0 0 calc(2 * 100% / 12);
    max-width: calc(2 * 100% / 12);
  }

  .col-xl-3 {
    flex: 0 0 calc(3 * 100% / 12);
    max-width: calc(3 * 100% / 12);
  }

  .col-xl-4 {
    flex: 0 0 calc(4 * 100% / 12);
    max-width: calc(4 * 100% / 12);
  }

  .col-xl-5 {
    flex: 0 0 calc(5 * 100% / 12);
    max-width: calc(5 * 100% / 12);
  }

  .col-xl-6 {
    flex: 0 0 calc(6 * 100% / 12);
    max-width: calc(6 * 100% / 12);
  }

  .col-xl-7 {
    flex: 0 0 calc(7 * 100% / 12);
    max-width: calc(7 * 100% / 12);
  }

  .col-xl-8 {
    flex: 0 0 calc(8 * 100% / 12);
    max-width: calc(8 * 100% / 12);
  }

  .col-xl-9 {
    flex: 0 0 calc(9 * 100% / 12);
    max-width: calc(9 * 100% / 12);
  }

  .col-xl-10 {
    flex: 0 0 calc(10 * 100% / 12);
    max-width: calc(10 * 100% / 12);
  }

  .col-xl-11 {
    flex: 0 0 calc(11 * 100% / 12);
    max-width: calc(11 * 100% / 12);
  }

  .col-xl-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
