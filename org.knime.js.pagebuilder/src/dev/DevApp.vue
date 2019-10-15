<script>
import PageBuilder from '../components/PageBuilder.vue';

const supportedViewStates = ['page', 'executing', 'result'];

export default {
    components: {
        PageBuilder
    },
    computed: {
        supportedViewStates() {
            return supportedViewStates;
        },
        pageMocks() {
            const mocks = require.context('../../mocks', false, /.json$/); // eslint-disable-line no-undef
            return mocks.keys().sort().map(x => ({
                name: x.replace('./', ''),
                src: mocks(x)
            }));
        }
    },
    methods: {
      onPageSelect(e) {
        let page = { page: this.pageMocks[e.srcElement.selectedOptions[0].index - 1].src };
        this.$store.dispatch('pagebuilder/setPage', page);
      }
    },
    created() {
        let store = this.$store;
        let pageMocks = this.pageMocks;
        const delay = 500;
        let setRandomPage = () => new Promise((resolve) => {
            window.setTimeout(() => {
                let randomPage = pageMocks[Math.floor(Math.random() * pageMocks.length)];
                store.dispatch('pagebuilder/setPage', { page: randomPage.src });
                resolve();
            }, delay);
        });
        PageBuilder.initStore({
            async nextPage() {
                consola.trace('PageBuilder: Proxying call for next page');
                await setRandomPage();
            },
            async previousPage() {
                consola.trace('PageBuilder: Proxying call for previous page');
                await setRandomPage();
            }
        }, store);
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
      View state: <select v-model="$store.state.pagebuilder.viewState">
        <option :value="null">-</option>
        <option
          v-for="state in supportedViewStates"
          :key="state"
          :value="state"
        >
          {{ state }}
        </option>
      </select>
      Page mock:
      <select 
        v-on:change="onPageSelect"
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
    </p>

    <div class="frame">
      <PageBuilder />
    </div>
  </div>
</template>

<style lang="postcss">
@import "webapps-common/ui/css/variables";

body {
  font-family: "Roboto", "Arial", sans-serif;
  font-weight: 300;
}

.frame {
  border: 5px solid orange;
}

.container-fluid:hover iframe {
  outline: 2px dotted dodgerblue;
  box-shadow: 0 0 5px cyan;
}
</style>
