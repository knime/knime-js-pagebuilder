import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStore } from "vuex";

import * as storeConfig from "@/store/service";

describe("service store", () => {
  let store;

  beforeEach(() => {
    store = createStore(storeConfig);
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates an empty store", () => {
    expect(store.state).toEqual({
      services: {},
    });
  });

  describe("service store actions", () => {
    const serviceId = "myServiceId";

    it("registers a service", async () => {
      const onServiceEvent = vi.fn();
      const service = { onServiceEvent, serviceId };
      await store.dispatch("registerService", { service });
      expect(store.state.services[service.serviceId]).toStrictEqual(service);
    });

    it("dispatches push events", async () => {
      const onServiceEvent = vi.fn();
      const service = { onServiceEvent, serviceId };
      await store.dispatch("registerService", { service });
      let mockEvent = { payload: "message" };
      await store.dispatch("pushEvent", { event: mockEvent });
      expect(onServiceEvent).toHaveBeenCalledWith(mockEvent);
    });

    it("deregisters a service", async () => {
      const onServiceEvent = vi.fn();
      const service = { onServiceEvent, serviceId };
      await store.dispatch("registerService", { service });
      expect(store.state.services[service.serviceId]).toStrictEqual(service);
      await store.dispatch("deregisterService", { service });
      expect(store.state.services[service.serviceId]).toBeUndefined();
    });
  });
});
