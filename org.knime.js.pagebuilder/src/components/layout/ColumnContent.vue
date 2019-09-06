<script>
import KnimeView from './KnimeView';
import Layout from './Layout';

export default {
    components: {
        KnimeView,
        Layout
        // Row compontent is added dynamically in beforeCreate() method, see below
    },
    props: {
        item: {
            default: () => {},
            type: Object
        }
    },
    beforeCreate() {
        // dynamic import because of recursive components (see https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components)
        this.$options.components.Row = require('./Row.vue').default; // eslint-disable-line
    }
};
</script>

<template>
  <KnimeView
    v-if="item.type === 'view'"
    :view="item"
  />
  <Row
    v-else-if="item.type === 'row'"
    :row="item"
  />
  <Layout
    v-else-if="item.type === 'nestedLayout'"
    :layout="item.layout"
  />
  <div
    v-else-if="item.type === 'html'"
    v-html="item.value"
  />
</template>

<style lang="postcss" scoped>
</style>
