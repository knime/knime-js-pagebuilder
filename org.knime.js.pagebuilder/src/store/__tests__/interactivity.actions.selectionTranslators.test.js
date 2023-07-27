import { expect, describe, beforeEach, it, vi } from "vitest";
import { createStore } from "vuex";

import * as storeConfig from "@/store/interactivity";

describe("Interactivity store", () => {
  let store;

  beforeEach(() => {
    store = createStore(storeConfig);
    vi.resetAllMocks();
  });

  const prefix = "selection-";
  const sourceID = "0.0.7";
  const targetIDs = ["0.0.9"];
  const multipleTargetIDs = ["0.0.3", "0.0.8", "0.0.9"];

  describe("register translators", () => {
    it("does not subscribe invalid selection translators", () => {
      let invalidTranslator = { dummyElement: "foo" };
      store.dispatch("registerSelectionTranslator", {
        translator: invalidTranslator,
      });
      expect(store.state).toEqual({});
      invalidTranslator = { sourceID: "foo" };
      store.dispatch("registerSelectionTranslator", {
        translator: invalidTranslator,
      });
      expect(store.state).toEqual({});
      invalidTranslator = { targetIDs };
      store.dispatch("registerSelectionTranslator", {
        translator: invalidTranslator,
      });
      expect(store.state).toEqual({});
      invalidTranslator = { sourceID, targetIDs };
      store.dispatch("registerSelectionTranslator", {
        translator: invalidTranslator,
      });
      expect(store.state).toEqual({});
      invalidTranslator = { sourceID, targetIDs, forward: false };
      store.dispatch("registerSelectionTranslator", {
        translator: invalidTranslator,
      });
      expect(store.state).toEqual({});
    });

    it("allows registering a forwarding selection translator without mapping", () => {
      let translator = { sourceID, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", { translator });
      expect(store.state[prefix + sourceID]).toBeDefined();
      expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
      expect(store.state[prefix + targetIDs[0]]).toBeDefined();
      expect(store.state[prefix + targetIDs[0]].subscribers[0]).toBeDefined();
    });

    it("allows registering a selection translator with mapping", () => {
      let dummyMapping = {};
      let translator = { sourceID, targetIDs, mapping: dummyMapping };
      store.dispatch("registerSelectionTranslator", { translator });
      expect(store.state[prefix + sourceID]).toBeDefined();
      expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
      expect(store.state[prefix + targetIDs[0]]).toBeDefined();
      expect(store.state[prefix + targetIDs[0]].subscribers[0]).toBeDefined();
    });

    it("registers multiple targets of a selection translator", () => {
      let translator = {
        sourceID,
        targetIDs: multipleTargetIDs,
        forward: true,
      };
      store.dispatch("registerSelectionTranslator", { translator });
      expect(store.state[prefix + sourceID]).toBeDefined();
      expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
      multipleTargetIDs.forEach((targetID) => {
        expect(store.state[prefix + targetID]).toBeDefined();
        expect(store.state[prefix + targetID].subscribers[0]).toBeDefined();
      });
    });
  });

  describe("updating translators", () => {
    it("does not update invalid selection translators", () => {
      let invalidTranslators = [{ dummyElement: "foo" }];
      store.dispatch("updateSelectionTranslators", {
        translators: invalidTranslators,
      });
      expect(store.state).toEqual({});
      invalidTranslators[0] = { sourceID: "foo" };
      store.dispatch("updateSelectionTranslators", {
        translators: invalidTranslators,
      });
      expect(store.state).toEqual({});
      invalidTranslators[0] = { targetIDs };
      store.dispatch("updateSelectionTranslators", {
        translators: invalidTranslators,
      });
      expect(store.state).toEqual({});
      invalidTranslators[0] = { sourceID, targetIDs };
      store.dispatch("updateSelectionTranslators", {
        translators: invalidTranslators,
      });
      expect(store.state).toEqual({});
      invalidTranslators[0] = { sourceID, targetIDs, forward: false };
      store.dispatch("updateSelectionTranslators", {
        translators: invalidTranslators,
      });
      expect(store.state).toEqual({});
    });

    it("adds translators which are not yet registered", () => {
      let translators = [{ sourceID, targetIDs, forward: true }];
      store.dispatch("updateSelectionTranslators", { translators });
      expect(store.state[prefix + sourceID]).toBeDefined();
      expect(store.state[prefix + sourceID].subscribers[0]).toBeDefined();
      expect(store.state[prefix + targetIDs[0]]).toBeDefined();
      expect(store.state[prefix + targetIDs[0]].subscribers[0]).toBeDefined();
    });

    it("updates translators which are already registered", () => {
      let translator = { sourceID, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", { translator });
      let cb = store.state[prefix + sourceID].subscribers[0].callback;
      store.dispatch("updateSelectionTranslators", {
        translators: [translator],
      });
      expect(cb).not.toEqual(
        store.state[prefix + sourceID].subscribers[0].callback,
      );
    });

    it("ignores targetIDs during update which are not registered", () => {
      let translator = { sourceID, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", { translator });
      expect(store.state[prefix + sourceID].subscribers).toHaveLength(1);
      store.dispatch("updateSelectionTranslators", {
        translators: [
          { sourceID, targetIDs: multipleTargetIDs, forward: true },
        ],
      });
      expect(store.state[prefix + sourceID].subscribers).toHaveLength(1);
    });

    it("keeps non-translator subscribers registered during update", () => {
      let translator = { sourceID, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", { translator });
      let subscriber = vi.fn();
      let id = prefix + targetIDs[0];
      store.dispatch("subscribe", { id, callback: subscriber });
      expect(store.state[id].subscribers).toHaveLength(2);
      let cbs = store.state[id].subscribers.map(
        (subscriber) => subscriber.callback,
      );
      translator = { sourceID, targetIDs, forward: true };
      store.dispatch("updateSelectionTranslators", {
        translators: [translator],
      });
      expect(store.state[id].subscribers).toHaveLength(2);
      // ensure anonymous callbacks have been updated
      store.state[id].subscribers.forEach((subscriber, subInd) => {
        expect(subscriber.callback).not.toEqual(cbs[subInd]);
      });
    });

    it("removes outdated translator references during update", () => {
      let translator1 = { sourceID, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", {
        translator: translator1,
      });
      let translator2 = { sourceID: "7:0:0", targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", {
        translator: translator2,
      });
      let id = prefix + targetIDs[0];
      expect(store.state[id].subscribers).toHaveLength(2);
      store.dispatch("updateSelectionTranslators", {
        translators: [translator1],
      });
      expect(store.state[id].subscribers).toHaveLength(1);
    });

    it("clears outdated translator data during update", () => {
      let translator = { sourceID, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", { translator });
      let payload = { changeSet: { added: ["Row42"] } };
      store.dispatch("publish", { id: prefix + sourceID, data: payload });
      expect(store.state[prefix + sourceID].data.elements).toHaveLength(1);
      store.dispatch("updateSelectionTranslators", {
        translators: [translator],
      });
      expect(store.state[prefix + sourceID].data.elements).toHaveLength(0);
    });

    it("updates multiple subscribers with shared sources without losing updated targets", () => {
      let targetIDs = ["0:0:7"];
      let sourceID = "main_source";
      let subSourceId = "sub_source";
      let translator1 = { sourceID, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", {
        translator: translator1,
      });
      let translator2 = { sourceID: subSourceId, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", {
        translator: translator2,
      });
      let translator3 = {
        sourceID: subSourceId,
        targetIDs: [sourceID],
        forward: true,
      };
      store.dispatch("registerSelectionTranslator", {
        translator: translator3,
      });
      let targetId = prefix + targetIDs[0];
      let targetId2 = `${prefix}${sourceID}`;
      let targetId3 = `${prefix}${subSourceId}`;
      // non-translator 0:0:7 includes both main and sub-source subscribers
      expect(store.state[targetId].subscribers).toHaveLength(2);
      // main_source subscribers expected to be sub_source subscriber and self/sourceToTarget
      expect(store.state[targetId2].subscribers).toHaveLength(2);
      // both self/sourceToTarget subscribers expected to be registered
      expect(store.state[targetId3].subscribers).toHaveLength(2);
      store.dispatch("updateSelectionTranslators", {
        translators: [translator2, translator3],
      });
      // main_source -> 0:0:7 outdated subscriber expected to be removed
      expect(store.state[targetId].subscribers).toHaveLength(1);
      // sub_source -> main_source only subscriber (no longer translator) after clearing outdated translators
      expect(store.state[targetId2].subscribers).toHaveLength(1);
      // both sourceToTarget translators present in the updated, shared source translator
      expect(store.state[targetId3].subscribers).toHaveLength(2);
    });
  });

  describe("selection event mapping", () => {
    it("forwards selection event to target", () => {
      let translator = { sourceID, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", { translator });
      let subscriber = vi.fn();
      store.dispatch("subscribe", {
        id: prefix + targetIDs[0],
        callback: subscriber,
      });
      expect(subscriber).not.toHaveBeenCalled();
      let payload = { changeSet: { added: ["Row42"] } };
      store.dispatch("publish", { id: prefix + sourceID, data: payload });
      expect(subscriber).toHaveBeenCalledWith(
        prefix + targetIDs[0],
        expect.objectContaining(payload),
      );
    });

    it("forwards selection event to multiple targets", () => {
      let translator = {
        sourceID,
        targetIDs: multipleTargetIDs,
        forward: true,
      };
      store.dispatch("registerSelectionTranslator", { translator });
      let callbacks = [];
      multipleTargetIDs.forEach((targetID) => {
        let callback = vi.fn();
        callbacks.push(callback);
        store.dispatch("subscribe", { id: prefix + targetID, callback });
        expect(callback).not.toHaveBeenCalled();
      });
      let payload = { changeSet: { added: ["Row42"] } };
      store.dispatch("publish", { id: prefix + sourceID, data: payload });
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining(payload),
        );
      });
    });

    it("forwards selection event to source", () => {
      let translator = { sourceID, targetIDs, forward: true };
      store.dispatch("registerSelectionTranslator", { translator });
      let subscriber = vi.fn();
      store.dispatch("subscribe", {
        id: prefix + sourceID,
        callback: subscriber,
      });
      expect(subscriber).not.toHaveBeenCalled();
      let payload = { changeSet: { added: ["Row42"] } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      expect(subscriber).toHaveBeenCalledWith(
        prefix + sourceID,
        expect.objectContaining(payload),
      );
    });

    it("does not map selection event without change set", () => {
      let dummyMapping = {};
      let translator = { sourceID, targetIDs, mapping: dummyMapping };
      store.dispatch("registerSelectionTranslator", { translator });
      let payload = {};
      expect(() =>
        store.dispatch("publish", { id: prefix + sourceID, data: payload }),
      ).toThrow();
    });

    it("maps selection event with mapping to target", () => {
      let mapping = { wibble: ["wobble"] };
      let translator = { sourceID, targetIDs, mapping };
      store.dispatch("registerSelectionTranslator", { translator });
      let subscriber = vi.fn();
      store.dispatch("subscribe", {
        id: prefix + targetIDs[0],
        callback: subscriber,
      });
      let payload = { changeSet: { added: ["wibble"] } };
      store.dispatch("publish", { id: prefix + sourceID, data: payload });
      expect(subscriber).toHaveBeenCalledWith(
        prefix + targetIDs[0],
        expect.objectContaining({
          changeSet: { added: mapping.wibble },
        }),
      );
    });

    it("maps selection event with simple mapping to source", () => {
      let mapping = { wibble: ["wobble"] };
      let translator = { sourceID, targetIDs, mapping };
      store.dispatch("registerSelectionTranslator", { translator });
      let subscriber = vi.fn();
      store.dispatch("subscribe", {
        id: prefix + sourceID,
        callback: subscriber,
      });
      let payload = { changeSet: { added: ["wobble"] } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      expect(subscriber).toHaveBeenCalledWith(
        prefix + sourceID,
        expect.objectContaining({
          changeSet: { added: ["wibble"] },
        }),
      );
    });

    it("does not map selection items not existing in mapping", () => {
      let mapping = { wibble: ["wobble"] };
      let translator = { sourceID, targetIDs, mapping };
      store.dispatch("registerSelectionTranslator", { translator });
      let subscriber = vi.fn();
      store.dispatch("subscribe", {
        id: prefix + targetIDs[0],
        callback: subscriber,
      });
      let payload = { changeSet: { added: ["foo"] } };
      store.dispatch("publish", { id: prefix + sourceID, data: payload });
      expect(subscriber).not.toHaveBeenCalled();
    });

    it("maps selection event with multiple mapping to target", () => {
      let mapping = { wibble: ["wobble", "wubble", "flob"] };
      let translator = { sourceID, targetIDs, mapping };
      store.dispatch("registerSelectionTranslator", { translator });
      let subscriber = vi.fn();
      store.dispatch("subscribe", {
        id: prefix + targetIDs[0],
        callback: subscriber,
      });
      let payload = { changeSet: { added: ["wibble"] } };
      store.dispatch("publish", { id: prefix + sourceID, data: payload });
      expect(subscriber).toHaveBeenCalledWith(
        prefix + targetIDs[0],
        expect.objectContaining({
          changeSet: { added: mapping.wibble },
        }),
      );
      payload = { changeSet: { removed: ["wibble"] } };
      store.dispatch("publish", { id: prefix + sourceID, data: payload });
      expect(subscriber).toHaveBeenLastCalledWith(
        prefix + targetIDs[0],
        expect.objectContaining({
          changeSet: { removed: mapping.wibble },
        }),
      );
    });

    it("maps selection event with multiple mapping to source", () => {
      let mapping = { wibble: ["wobble", "wubble", "flob"] };
      let translator = { sourceID, targetIDs, mapping };
      store.dispatch("registerSelectionTranslator", { translator });
      let subscriber = vi.fn();
      store.dispatch("subscribe", {
        id: prefix + sourceID,
        callback: subscriber,
      });
      let payload = { changeSet: { added: mapping.wibble } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      expect(subscriber).toHaveBeenCalledWith(
        prefix + sourceID,
        expect.objectContaining({
          changeSet: { added: ["wibble"] },
        }),
      );
      payload = { changeSet: { removed: mapping.wibble } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      expect(subscriber).toHaveBeenLastCalledWith(
        prefix + sourceID,
        expect.objectContaining({
          changeSet: { removed: ["wibble"] },
        }),
      );
    });

    it("handles partial mappings to source", () => {
      let mapping = { wibble: ["wobble", "wubble", "flob"] };
      let translator = { sourceID, targetIDs, mapping };
      store.dispatch("registerSelectionTranslator", { translator });
      let subscriber = vi.fn();
      store.dispatch("subscribe", {
        id: prefix + sourceID,
        callback: subscriber,
      });

      let payload = { changeSet: { added: ["wobble"] } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      // adding a single mapped item results in a new partial selection
      expect(subscriber).toHaveBeenCalledWith(
        prefix + sourceID,
        expect.objectContaining({
          changeSet: { partialAdded: ["wibble"] },
        }),
      );

      vi.resetAllMocks();
      payload = { changeSet: { added: ["wubble"] } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      // no change to mapped event, subscriber is not called
      expect(subscriber).not.toHaveBeenCalled();

      payload = { changeSet: { added: ["flob"] } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      // all mapped items added which adds the whole item and removes partial
      expect(subscriber).toHaveBeenLastCalledWith(
        prefix + sourceID,
        expect.objectContaining({
          changeSet: { added: ["wibble"], partialRemoved: ["wibble"] },
        }),
      );

      payload = { changeSet: { removed: ["wobble"] } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      // removing a single mapped item results in a new partial selection
      expect(subscriber).toHaveBeenLastCalledWith(
        prefix + sourceID,
        expect.objectContaining({
          changeSet: { removed: ["wibble"], partialAdded: ["wibble"] },
        }),
      );

      vi.resetAllMocks();
      payload = { changeSet: { removed: ["flob"] } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      // no change to mapped event, subscriber is not called
      expect(subscriber).not.toHaveBeenCalled();

      payload = { changeSet: { removed: ["wubble"] } };
      store.dispatch("publish", { id: prefix + targetIDs[0], data: payload });
      // removing the last remaining mapped item removes the partial selection
      expect(subscriber).toHaveBeenLastCalledWith(
        prefix + sourceID,
        expect.objectContaining({
          changeSet: { partialRemoved: ["wibble"] },
        }),
      );
    });
  });
});
