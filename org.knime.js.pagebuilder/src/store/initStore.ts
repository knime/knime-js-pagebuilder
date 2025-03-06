import { Store } from "vuex";

import * as alertStoreConfig from "@/store/alert";
import * as dialogStoreConfig from "@/store/dialog";
import * as interactivityStoreConfig from "@/store/interactivity";
import * as pagebuilderStoreConfig from "@/store/pagebuilder";
import * as serviceStoreConfig from "@/store/service";

/*
 * This will initialize an already existing store with the pagebuilder store modules.
 * This allows the integration of the pagebuilder into another vue app that already has a store.
 */
export const initStore = (store: Store<any>) => {
  store.registerModule("pagebuilder", pagebuilderStoreConfig);
  store.registerModule("pagebuilder/interactivity", interactivityStoreConfig);
  store.registerModule("pagebuilder/alert", alertStoreConfig);
  store.registerModule("pagebuilder/service", serviceStoreConfig);
  store.registerModule("pagebuilder/dialog", dialogStoreConfig);
};
