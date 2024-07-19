<script>
import PageBuilder from "../components/PageBuilder.vue";

export default {
  components: {
    PageBuilder,
  },
  data() {
    return {
      currentPageIndex: 3,
    };
  },
  computed: {
    pageMocks() {
      const mocks = import.meta.glob("@@/mocks/*.json", { eager: true });
      return Object.keys(mocks)
        .sort()
        .map((file) => ({
          name: file.replace("/mocks/", ""),
          src: mocks[file].default, // .default needed for reactivity to work
        }));
    },
  },
  watch: {
    currentPageIndex(newIndex) {
      localStorage.setItem("pageIndex", newIndex);
    },
  },
  created() {
    let store = this.$store;
    PageBuilder.initStore(store);
    // load default page mock
    if (localStorage && localStorage.pageIndex) {
      this.currentPageIndex = Number(localStorage.getItem("pageIndex"));
    }
    let pageMock = this.pageMocks[this.currentPageIndex];
    this.$store.dispatch("pagebuilder/setPage", {
      page: pageMock ? pageMock.src : null,
    });
  },
  methods: {
    onPageSelect(e) {
      let pageIndex = e.target.selectedOptions[0].index - 1;
      this.currentPageIndex = pageIndex;
      let pageMock = this.pageMocks[pageIndex];
      this.$store.dispatch("pagebuilder/setPage", {
        page: pageMock ? pageMock.src : null,
      });
    },
    async onValidate() {
      try {
        let viewValidities = await this.$store.dispatch(
          "pagebuilder/getValidity",
        );
        console.debug("viewValidities", viewValidities); // eslint-disable-line no-console
      } catch (e) {
        console.error("error while validating", e); // eslint-disable-line no-console
      }
    },
    async onGetViewValues() {
      try {
        let viewValues = await this.$store.dispatch(
          "pagebuilder/getViewValues",
        );
        console.debug("viewValues", viewValues); // eslint-disable-line no-console
      } catch (e) {
        console.error("error while getting viewValues", e); // eslint-disable-line no-console
      }
    },
  },
};
</script>

<template>
  <div>
    <h1>KNIME PageBuilder Dev App with mocks</h1>
    <p>
      This app provides a standalone development environment with hot reloading
      using mocked pages. See the README file for ways to integrate a
      development version into KNIME Analytics Platform.
    </p>
    <p>
      Page mock:
      <select @change="onPageSelect">
        <option>-</option>
        <option
          v-for="(page, index) in pageMocks"
          :key="page.name"
          :selected="index === currentPageIndex"
        >
          {{ page.name }}
        </option>
      </select>
      <button @click="onValidate">print view validity to console</button>
      <button @click="onGetViewValues">print view values to console</button>
    </p>

    <div class="frame">
      <PageBuilder />
    </div>
  </div>
</template>

<style lang="postcss">
@import url("@knime/styles/css");

body {
  margin: 10px;
  font-size: 18px;
  line-height: 26px;
  color: var(--knime-masala);
}

.frame {
  border: 5px solid orange;
}

.container-fluid:hover iframe {
  outline: 2px dotted dodgerblue;
  box-shadow: 0 0 5px cyan;
}
</style>
