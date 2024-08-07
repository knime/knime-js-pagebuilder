import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStore } from "vuex";

import * as storeConfig from "@/store/interactivity";

describe("Interactivity store", () => {
  let store;

  beforeEach(() => {
    store = createStore(storeConfig);
    vi.resetAllMocks();
  });

  it("creates an empty store", () => {
    expect(store.state).toEqual({});
  });

  describe("getters", () => {
    describe("allows getting the published data", () => {
      it("returns the data", () => {
        let id = "selection-12345-12345-12345";
        let minimalDummyData = { elements: [{ id: 1, testData: 1 }] };
        let payload = { id, data: minimalDummyData, callback: vi.fn() };
        store.dispatch("publish", payload);

        expect(store.getters.getPublishedData(id)).toEqual(payload.data);
      });

      it("returns null if nothing published", () => {
        expect(store.getters.getPublishedData("doesntexist-12345")).toBeNull();
      });
    });
  });
});
