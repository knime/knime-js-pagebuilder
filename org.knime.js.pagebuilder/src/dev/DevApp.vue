<script>
import PageBuilder from '../components/PageBuilder.vue';

export default {
    components: {
        PageBuilder
    },
    computed: {
        pageMocks() {
            const mocks = require.context('../../mocks', false, /.json$/); // eslint-disable-line no-undef
            return mocks.keys().sort().map(x => ({
                name: x.replace('./', ''),
                src: mocks(x)
            }));
        }
    },
    created() {
        let store = this.$store;
        PageBuilder.initStore(store);
    },
    methods: {
        onPageSelect(e) {
            let pageMock = this.pageMocks[e.target.selectedOptions[0].index - 1];
            this.$store.dispatch('pagebuilder/setPage', { page: pageMock ? pageMock.src : null });
        },
        async onGetViewValues() {
            try {
                let viewValues = await this.$store.dispatch('pagebuilder/getViewValues');
                console.debug('viewValues', viewValues); // eslint-disable-line no-console
            } catch (e) {
                console.error('error while getting viewValues', e); // eslint-disable-line no-console
            }
        }
    }
};
</script>

<template>
  <div>
    <h1>PageBuilder Dev App</h1>
    <p>
      This webportal app simulator can be run with <code>npm run dev</code> and features hot reloading when any source
      file changes.
    </p>
    <p>
      Use <code>npm run dev-inte</code> to integrate with the dev mode of the <code>knime-webportal</code>
      project.
    </p>
    <p>
      See the README file for details.
    </p>
    <p>
      Page mock:
      <select
        @change="onPageSelect"
      >
        <option :value="null">-</option>
        <option
          v-for="page in pageMocks"
          :key="page.name"
          :value="page.src"
        >
          {{ page.name }}
        </option>
      </select>
      <button @click="onGetViewValues">print view values to console</button>
    </p>

    <div class="frame">
      <PageBuilder />
    </div>
  </div>
</template>

<style lang="postcss">
@import "normalize.css";
@import "webapps-common/ui/css/variables";

body {
  font-family: "Roboto", "Arial", sans-serif;
  font-weight: 300;
  margin: 10px;
}

.frame {
  border: 5px solid orange;
}

.container-fluid:hover iframe {
  outline: 2px dotted dodgerblue;
  box-shadow: 0 0 5px cyan;
}
</style>
