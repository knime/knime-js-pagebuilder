import { createApp } from "vue";
import type { Store } from "vuex";

import PageBuilderComponent from "./components/PageBuilder.vue";
import * as alertStoreConfig from "./store/alert";
import * as dialogStoreConfig from "./store/dialog";
import * as interactivityStoreConfig from "./store/interactivity";
import * as pagebuilderStoreConfig from "./store/pagebuilder";
import * as serviceStoreConfig from "./store/service";

export const initStore = (store: Store<any>) => {
  store.registerModule("pagebuilder", pagebuilderStoreConfig);
  store.registerModule("pagebuilder/interactivity", interactivityStoreConfig);
  store.registerModule("pagebuilder/alert", alertStoreConfig);
  store.registerModule("pagebuilder/service", serviceStoreConfig);
  store.registerModule("pagebuilder/dialog", dialogStoreConfig);
};

export const createShadowApp = (
  shadowRoot: ShadowRoot,
  store: Store<any>,
): { unmount: () => void } => {
  const container = document.createElement("div");
  shadowRoot.appendChild(container);

  const style = document.createElement("style");
  // @ts-ignore - will be replaced by the build tool see vite.config.ts
  style.textContent = __INLINE_CSS_CODE__;
  shadowRoot.appendChild(style);

  const shadowApp = createApp(PageBuilderComponent);
  shadowApp.use(store);
  shadowApp.mount(container);

  return {
    unmount: shadowApp.unmount,
  };
};
