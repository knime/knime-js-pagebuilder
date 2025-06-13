import { createApp } from "vue";
import { type Module, type StoreOptions, createStore } from "vuex";

import PageBuilderComponent from "./components/PageBuilder.vue";
import * as alertStoreConfig from "./store/alert";
import * as dialogStoreConfig from "./store/dialog";
import * as interactivityStoreConfig from "./store/interactivity";
import * as pagebuilderStoreConfig from "./store/pagebuilder";
import * as serviceStoreConfig from "./store/service";

const validateStoreConfig = (storeConfig: StoreOptions<any>) => {
  if (!storeConfig.actions?.mount) {
    consola.warn("storeConfig.actions.mount is missing");
    return false;
  }
  if (!storeConfig.actions?.onChange) {
    consola.warn("storeConfig.actions.onChange is missing");
    return false;
  }
  return true;
};

export type PageBuilderApi = {
  mountShadowApp: (shadowRoot: ShadowRoot) => void;
  loadPage: (
    projectId: string,
    workflowId: string,
    nodeId: string,
  ) => Promise<void>;
  isDirty: () => Promise<boolean>;
  isDefault: () => Promise<boolean>;
  hasPage: () => boolean;
  applyToDefaultAndExecute: () => Promise<void>;
  applyAndExecute: () => Promise<void>;
  unmountShadowApp: () => void;
};

export const createPageBuilderApp = async (
  apiStoreConfig: Module<any, any>,
  resourceBaseUrl: string,
): Promise<PageBuilderApi> => {
  consola.debug(
    "Creating Pagebuilder store and app with resourceUrl ",
    resourceBaseUrl,
  );

  if (!validateStoreConfig(apiStoreConfig)) {
    throw new Error(
      `Invalid store configuration ${JSON.stringify(apiStoreConfig)}`,
    );
  }

  const app = createApp(PageBuilderComponent);
  const store = createStore({
    modules: {
      api: apiStoreConfig,
      pagebuilder: pagebuilderStoreConfig,
      "pagebuilder/interactivity": interactivityStoreConfig,
      "pagebuilder/alert": alertStoreConfig,
      "pagebuilder/dialog": dialogStoreConfig,
      "pagebuilder/service": serviceStoreConfig,
      wizardExecution: {
        getters: {
          // eslint-disable-next-line no-undefined
          currentJobId: () => undefined,
        },
        namespaced: true,
      },
    },
  });

  app.use(store);
  await store.dispatch("pagebuilder/setResourceBaseUrl", {
    resourceBaseUrl,
  });

  let alreadyMountedOnce = false;

  return {
    mountShadowApp: (shadowRoot: ShadowRoot) => {
      if (alreadyMountedOnce) {
        consola.warn(
          "Pagebuilder shadow app already mounted once and CANNOT be reused. " +
            "Please reuse createPageBuilderApp function.",
        );
        return;
      }
      consola.debug("Mounting Pagebuilder shadow app");

      const container = document.createElement("div");
      shadowRoot.appendChild(container);

      const style = document.createElement("style");
      // @ts-ignore - will be replaced by the build tool see vite.config.ts. Note: Only the first occurrence will be replaced.
      style.textContent = __INLINE_CSS_CODE__;
      shadowRoot.appendChild(style);

      app.mount(container);

      alreadyMountedOnce = true;
    },
    loadPage: async (projectId: string, workflowId: string, nodeId: string) => {
      consola.debug(
        "Loading page for PageBuilder: ",
        projectId,
        workflowId,
        nodeId,
      );
      await store.dispatch("api/mount", { projectId, workflowId, nodeId });
    },

    isDirty: () => store.dispatch("pagebuilder/isDirty"),
    isDefault: () => store.dispatch("pagebuilder/isDefault"),
    hasPage: () => Boolean(store.state.pagebuilder.page?.wizardPageContent),

    applyAndExecute: async () => {
      await store.dispatch("api/triggerReExecution", {});
    },
    applyToDefaultAndExecute: async () => {
      await store.dispatch("api/applyAsDefault", {});
    },
    unmountShadowApp: () => {
      consola.debug("Unmounting Pagebuilder shadow app");
      app.unmount();
    },
  };
};
