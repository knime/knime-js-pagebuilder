import { createApp } from "vue";
import consola from "consola";
import { createStore } from "vuex";

import App from "./DevApp.vue";

window.consola = consola.create({
  level:
    import.meta.env.KNIME_LOG_TO_CONSOLE === "true"
      ? import.meta.env.KNIME_LOG_LEVEL
      : -1,
});

const app = createApp(App);
const store = createStore();
app.use(store);
app.mount("#app");
