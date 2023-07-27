import { expect, describe, beforeEach, it, vi } from "vitest";
import { createStore } from "vuex";

import * as storeConfig from "@/store/interactivity";

describe("Interactivity store", () => {
  let store;
  const subscriberId = "selection-0.0.9";

  beforeEach(() => {
    store = createStore(storeConfig);
    vi.resetAllMocks();
  });

  it("add subscriber", () => {
    expect(store.state).toEqual({});
    let payload = { id: subscriberId, callback: vi.fn() };
    store.commit("addSubscriber", payload);
    expect(store.state[payload.id].subscribers.length).toBe(1);
    expect(store.state[payload.id].subscribers[0]).toEqual({
      callback: payload.callback,
    });
    // callback should only be stored
    expect(payload.callback).not.toHaveBeenCalled();

    // subscriber with same id added
    let payload2 = {
      id: subscriberId,
      callback: vi.fn(),
      elementFilter: ["dummy"],
    };
    store.commit("addSubscriber", payload2);
    expect(store.state[payload2.id].subscribers.length).toBe(2);
    expect(store.state[payload2.id].subscribers[1]).toEqual({
      callback: payload2.callback,
      filterIds: payload2.elementFilter,
    });
    // callback should only be stored
    expect(payload.callback).not.toHaveBeenCalled();
  });

  it("updates subscriber by clearing outdated translators", () => {
    expect(store.state).toEqual({});
    let id = "foo";
    let callback = vi.fn();
    store.state[id] = {
      subscribers: [
        { callback, filterIds: [], isTranslator: true },
        { callback, filterIds: [], isTranslator: true },
        { callback, filterIds: [] },
      ],
    };
    store.commit("updateSubscriber", {
      id,
      callback: vi.fn(),
      isTranslator: true,
      clear: true,
    });
    expect(store.state[id].subscribers).toHaveLength(2);
    expect(store.state[id].subscribers[0].isTranslator).toBeUndefined();
    expect(store.state[id].subscribers[1].callback).not.toEqual(callback);
  });

  it("updates subscriber without clearing translators", () => {
    expect(store.state).toEqual({});
    let id = "foo";
    let callback = vi.fn();
    store.state[id] = {
      subscribers: [
        { callback, filterIds: [], isTranslator: true },
        { callback, filterIds: [], isTranslator: true },
        { callback, filterIds: [] },
      ],
    };
    store.commit("updateSubscriber", {
      id,
      callback: vi.fn(),
      isTranslator: true,
    });
    expect(store.state[id].subscribers).toHaveLength(4);
  });

  it("remove subscriber", () => {
    expect(store.state).toEqual({});
    let payload = { id: subscriberId, callback: vi.fn() };
    store.commit("addSubscriber", payload);
    expect(store.state[payload.id].subscribers.length).toBe(1);
    expect(store.state[payload.id].subscribers[0]).toEqual({
      callback: payload.callback,
    });
    store.commit("addSubscriber", payload);
    expect(store.state[payload.id].subscribers.length).toBe(2);
    expect(store.state[payload.id].subscribers[1]).toEqual({
      callback: payload.callback,
    });
    store.commit("removeSubscriber", payload);
    expect(store.state[payload.id].subscribers.length).toBe(1);
    expect(store.state[payload.id].subscribers[0]).toEqual({
      callback: payload.callback,
    });
    store.commit("removeSubscriber", payload);
    expect(store.state).toEqual({});
  });

  it("add and remove subscriber with data present", () => {
    expect(store.state).toEqual({});
    let dataPayload = { id: subscriberId, data: "dummyData" };
    store.commit("updateData", dataPayload);
    expect(store.state[dataPayload.id].subscribers.length).toBe(0);

    let payload = { id: subscriberId, callback: vi.fn() };
    store.commit("addSubscriber", payload);
    expect(store.state[payload.id].subscribers.length).toBe(1);
    expect(store.state[payload.id].subscribers[0]).toEqual({
      callback: payload.callback,
    });
    store.commit("removeSubscriber", payload);
    expect(store.state[payload.id].subscribers).toBeDefined();
    expect(store.state[payload.id].subscribers.length).toBe(0);
  });

  it("update data", () => {
    expect(store.state).toEqual({});
    let dataPayload = { id: subscriberId, data: "wibble" };
    store.commit("updateData", dataPayload);
    expect(store.state[dataPayload.id]).toBeDefined();
    expect(store.state[dataPayload.id].data).toEqual(dataPayload.data);

    // overwrite data
    let dataPayload2 = { id: subscriberId, data: "wobble" };
    store.commit("updateData", dataPayload2);
    expect(store.state[dataPayload2.id]).toBeDefined();
    expect(store.state[dataPayload2.id].data).toEqual(dataPayload2.data);
  });

  it("clear state", () => {
    expect(store.state).toEqual({});
    let dataPayload = { id: subscriberId, data: "dummyData" };
    store.commit("updateData", dataPayload);
    expect(store.state[dataPayload.id]).toBeDefined();
    store.commit("clear");
    expect(store.state).toEqual({});
  });
});
