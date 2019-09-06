<script>
import Row from './Row';

export default {
    components: {
        Row
    },
    props: {
        layout: {
            default: () => {},
            type: Object
        }
    }
};
</script>

<template>
  <div>
    <Row
      v-for="(row, index) in layout.rows"
      :key="index"
      :row="row"
    />
  </div>
</template>


<style lang="postcss">
/* @import "bootstrap/dist/css/bootstrap-grid.css"; */
</style>

<style lang="postcss" scoped>
</style>
