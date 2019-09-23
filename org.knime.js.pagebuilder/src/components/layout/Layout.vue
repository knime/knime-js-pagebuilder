<script>
import Row from './Row';

export default {
    components: {
        Row
    },
    props: {
        layout: {
            default: () => ({}),
            type: Object
        }
    }
};
</script>

<template>
  <div class="container-fluid">
    <Row
      v-for="(row, index) in layout.rows"
      :key="index"
      :row="row"
    />
  </div>
</template>

<style lang="postcss" scoped>
.container-fluid {
  width: 100%;

  &,
  & >>> *,
  & >>> *::before,
  & >>> *::after {
    box-sizing: border-box;
  }
}
</style>
