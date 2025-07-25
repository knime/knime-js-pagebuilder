import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStore } from "vuex";

import { muteConsole } from "@knime/utils/test-utils";

import * as storeConfig from "@/store/pagebuilder";
import { generateUniqueStringFromViewValue } from "@/store/pagebuilder";

describe("PageBuilder store", () => {
  let store;

  let interactivityStoreConfig = {
    namespaced: true,
    actions: {
      registerSelectionTranslator: vi.fn(),
      updateSelectionTranslators: vi.fn(),
      clear: vi.fn(),
    },
  };

  let alertStoreConfig = {
    namespaced: true,
    actions: {
      showAlert: vi.fn(),
    },
  };

  let apiStoreConfig = {
    namespaced: true,
    actions: {
      triggerReExecution: vi.fn(),
    },
  };

  const page = {
    wizardExecutionState: "INTERACTION_REQUIRED",
    wizardPageContent: {
      version: "2.0",
      webNodePageConfiguration: {},
      webNodes: {},
    },
  };

  beforeEach(() => {
    store = createStore(storeConfig);
    store.registerModule("interactivity", interactivityStoreConfig);
    store.registerModule("alert", alertStoreConfig);
    store.registerModule("api", apiStoreConfig);
    vi.resetAllMocks();
  });

  it("creates an empty store", () => {
    expect(store.state.page).toBeNull();
    expect(store.state.resourceBaseUrl).toBe("");
    expect(store.state.pageValidators).toEqual({});
    expect(store.state.pageValueGetters).toEqual({});
    expect(store.state.webNodesLoading).toEqual([]);
  });

  it("allows setting page", () => {
    store.commit("setPage", page);
    expect(store.state.page).toEqual(page);
  });

  it("allows setting page via action", () => {
    store.dispatch("setPage", { page });
    expect(store.state.page).toEqual(page);
  });

  describe("isViewLayout", () => {
    it("sets isViewLayout to true", () => {
      let page = {
        wizardPageContent: {
          webNodes: { "1:2:3": {} },
          nodeViews: { "4:5:6": {} },
        },
      };
      store.dispatch("setPage", { page });
      expect(store.state.isViewLayout).toBe(true);
    });

    it("sets isViewLayout to false on headless rendering", () => {
      let page = {
        wizardPageContent: {
          webNodes: { "1:2:3": {} },
          nodeViews: { "4:5:6": {} },
        },
      };
      window.headless = true;
      store.dispatch("setPage", { page });
      expect(store.state.isViewLayout).toBe(false);
      delete window.headless;
    });

    it("sets isViewLayout to true if single view", () => {
      let page = {
        wizardPageContent: {
          nodeViews: { SINGLE: {} },
        },
      };
      store.dispatch("setPage", { page });
      expect(store.state.isViewLayout).toBe(true);
    });

    it("sets isViewLayout to false if dialog", () => {
      let page = {
        wizardPageContent: {
          nodeViews: {
            DIALOG: {
              extensionType: "dialog",
            },
          },
        },
      };
      store.dispatch("setPage", { page });
      expect(store.state.isViewLayout).toBe(false);
    });

    it("sets isViewLayout to false if dialog and view", () => {
      let page = {
        wizardPageContent: {
          nodeViews: {
            DIALOG: {
              extensionType: "dialog",
            },
            VIEW: {
              extensionType: "view",
            },
          },
        },
      };
      store.dispatch("setPage", { page });
      expect(store.state.isViewLayout).toBe(false);
    });

    it("sets isViewLayout to false if reporting is active", () => {
      let page = {
        wizardPageContent: {
          webNodePageConfiguration: {
            generatedReportActionId: true,
          },
          webNodes: { "1:2:3": {} },
          nodeViews: { "4:5:6": {} },
        },
      };
      store.dispatch("setPage", { page });
      expect(store.state.isViewLayout).toBe(false);
    });
  });

  it("sets re-executing nodes", () => {
    let nodesReExecuting = ["1", "2"];
    expect(store.state.nodesReExecuting).toEqual([]);
    store.commit("setNodesReExecuting", nodesReExecuting);
    expect(store.state.nodesReExecuting).toEqual(nodesReExecuting);
  });

  it("updates nodes re-executing if null received", () => {
    let nodesReExecuting = ["1", "2"];
    expect(store.state.nodesReExecuting).toEqual([]);
    store.commit("setNodesReExecuting", nodesReExecuting);
    expect(store.state.nodesReExecuting).toEqual(nodesReExecuting);
    store.commit("setNodesReExecuting", null);
    expect(store.state.nodesReExecuting).toEqual([]);
  });

  it("updates nodes re-executing if empty re-executing nodes received", () => {
    let nodesReExecuting = ["1", "2"];
    expect(store.state.nodesReExecuting).toEqual([]);
    store.commit("setNodesReExecuting", nodesReExecuting);
    expect(store.state.nodesReExecuting).toEqual(nodesReExecuting);
    store.commit("setNodesReExecuting", []);
    expect(store.state.nodesReExecuting).toEqual([]);
  });

  it("allows setting re-executing nodes via action", () => {
    expect(store.state.nodesReExecuting).toEqual([]);
    store.dispatch("setPage", {});
    store.dispatch("setNodesReExecuting", true);
    expect(store.state.nodesReExecuting).toEqual([]);
  });

  it("handles empty pages during re-execution", () => {
    let nodesReExecuting = ["1", "2"];
    expect(store.state.nodesReExecuting).toEqual([]);
    store.dispatch("setNodesReExecuting", nodesReExecuting);
    expect(store.state.nodesReExecuting).toEqual(nodesReExecuting);
  });

  it("initializes re-execution using nodeIds from the page", () => {
    let page = {
      wizardPageContent: {
        webNodes: {
          id1: {
            foo: "bar",
          },
        },
      },
    };
    store.commit("setPage", page);
    expect(store.state.nodesReExecuting).toEqual([]);
    store.dispatch("setNodesReExecuting", true);
    expect(store.state.nodesReExecuting).toEqual(["id1"]);
  });

  it("clears interactivity when setting a page", () => {
    expect(interactivityStoreConfig.actions.clear).not.toHaveBeenCalled();
    store.dispatch("setPage", {});
    expect(interactivityStoreConfig.actions.clear).toHaveBeenCalled();
  });

  it("registers selection translators when setting a page", () => {
    expect(
      interactivityStoreConfig.actions.registerSelectionTranslator,
    ).not.toHaveBeenCalled();
    let dummyTranslator = "foo";
    let page = {
      wizardPageContent: {
        webNodePageConfiguration: {
          selectionTranslators: [dummyTranslator],
        },
      },
    };
    store.dispatch("setPage", { page });
    expect(
      interactivityStoreConfig.actions.registerSelectionTranslator,
    ).toHaveBeenCalledWith(expect.anything(), { translator: dummyTranslator });
  });

  it("dispatches reactivity events", () => {
    let nodeId = "0.0.7";
    let triggerReExecution = vi.fn();
    let apiStoreConfig = {
      namespaced: true,
      actions: {
        triggerReExecution,
      },
    };
    let localStore = createStore(storeConfig);
    localStore.registerModule("api", apiStoreConfig);
    localStore.dispatch("triggerReExecution", { nodeId });
    expect(triggerReExecution).toHaveBeenCalledWith(expect.anything(), {
      nodeId,
    });
  });

  it("silently handles missing api store for reactive actions", () => {
    expect(() =>
      store.dispatch("triggerReExecution", { nodeId: "0.0.7" }),
    ).not.toThrow();
  });

  it("updates re-execution count when executing node ids are updated", () => {
    expect(store.state.nodesReExecuting).toStrictEqual([]);
    expect(store.state.reExecutionUpdates).toBe(0);
    let nodesReExecuting = ["node1"];
    store.dispatch("setNodesReExecuting", nodesReExecuting);
    expect(store.state.nodesReExecuting).toStrictEqual(nodesReExecuting);
    expect(store.state.reExecutionUpdates).toBe(1);
    nodesReExecuting.push("node2");
    store.dispatch("setNodesReExecuting", nodesReExecuting);
    expect(store.state.nodesReExecuting).toStrictEqual(nodesReExecuting);
    expect(store.state.reExecutionUpdates).toBe(2);
  });

  it("allows setting resourceBaseUrl", () => {
    let resourceBaseUrl = "https://test-url.com/path";
    store.commit("setResourceBaseUrl", resourceBaseUrl);
    expect(store.state.resourceBaseUrl).toEqual(resourceBaseUrl);
  });

  it("allows setting resourceBaseUrl via action", () => {
    let resourceBaseUrl = "https://test-url.com/path";
    store.dispatch("setResourceBaseUrl", { resourceBaseUrl });
    expect(store.state.resourceBaseUrl).toEqual(resourceBaseUrl);
  });

  describe("node value getters", () => {
    it("allows adding valueGetter via action", async () => {
      let nodeId = "0.0.7";
      let valueGetter = function () {
        return Promise.resolve("foo");
      };
      expect(store.state.pageValueGetters[nodeId]).toBeUndefined();
      await store.dispatch("addValueGetter", { nodeId, valueGetter });
      expect(store.state.pageValueGetters[nodeId]).toEqual(valueGetter);
    });

    it("allows removing valueGetter via action", async () => {
      let nodeId = "0.0.7";
      let valueGetter = function () {
        return Promise.resolve("bar");
      };
      await store.dispatch("addValueGetter", { nodeId, valueGetter });
      expect(store.state.pageValueGetters[nodeId]).toEqual(valueGetter);
      store.dispatch("removeValueGetter", { nodeId });
      expect(store.state.pageValueGetters[nodeId]).toBeUndefined();
    });

    it("allows getting view values via action", async () => {
      let nodeId = "0.0.7";
      let sampleVal = { int: 42 };
      await store.dispatch("addValueGetter", {
        nodeId,
        valueGetter() {
          return Promise.resolve({ nodeId, value: sampleVal });
        },
      });

      let viewValues = await store.dispatch("getViewValues");
      expect(viewValues).toEqual({ [nodeId]: sampleVal });
    });

    it("returns empty object when getting view values fails", async () => {
      let nodeId = "0.0.7";
      await store.dispatch("addValueGetter", {
        nodeId,
        valueGetter() {
          return Promise.reject(new Error("error"));
        },
      });

      /* eslint-disable-next-line require-await */
      const viewValues = await muteConsole(async () =>
        store.dispatch("getViewValues"),
      );
      expect(viewValues).toStrictEqual({});
    });
  });

  it("allows setting loading state for webNodes", () => {
    expect(store.state.webNodesLoading.length).toBe(0);
    let nodeId = "0.0.7";
    store.dispatch("setWebNodeLoading", { nodeId, loading: true });
    expect(store.state.webNodesLoading.length).toBe(1);
    expect(store.state.webNodesLoading[0]).toBe(nodeId);
    store.dispatch("setWebNodeLoading", { nodeId, loading: false });
    expect(store.state.webNodesLoading.length).toBe(0);
  });

  describe("node value updates", () => {
    beforeEach(() => {
      let page = {
        wizardPageContent: {
          webNodes: {
            id1: {
              foo: "bar",
            },
          },
        },
      };
      store.commit("setPage", page);
    });

    it("prevents value modification with invalid keys", () => {
      let node = store.state.page.wizardPageContent.webNodes.id1;

      expect(node.foo).toBe("bar");

      let update = {
        nodeId: "id1",
        isValid: true,
        update: {
          fooBar: "rod", // wrong key
        },
      };

      muteConsole(() => store.commit("updateViewConfig", update));
      expect(node).toEqual({ foo: "bar" });
    });

    it("replaces web node configurations", () => {
      let node = store.state.page.wizardPageContent.webNodes.id1;

      expect(node.foo).toBe("bar");

      let update = {
        nodeId: "id1",
        config: {
          nodeId: "id2",
          some: "text",
        },
      };

      store.commit("updateViewConfig", update);

      setTimeout(() => {
        expect(store.state.page.wizardPageContent.webNodes.id1).not.toEqual({
          foo: "bar",
        });
        expect(store.state.page.wizardPageContent.webNodes.id1).toEqual(
          update.config,
        );
      }, 1000);
    });

    it("adds web node configurations", () => {
      expect(store.state.page.wizardPageContent.webNodes.id3).toBeUndefined();

      let update = {
        nodeId: "id3",
        config: {
          nodeId: "id3",
          some: "text",
        },
      };

      store.commit("updateViewConfig", update);

      setTimeout(() => {
        expect(store.state.page.wizardPageContent.webNodes.id3).toEqual(
          update.config,
        );
      }, 1000);
    });

    it("removes web node configurations", () => {
      let node = store.state.page.wizardPageContent.webNodes.id1;

      expect(node.foo).toBe("bar");

      let update = {
        nodeId: "id1",
        config: undefined,
      };

      store.commit("updateViewConfig", update);

      setTimeout(() => {
        expect(store.state.page.wizardPageContent.webNodes.id1).toBeUndefined();
      }, 1000);
    });

    // TODO WEBP-327 Remove if dialog option added.
    it("overrides required when present in web node configurations", () => {
      let node = store.state.page.wizardPageContent.webNodes.id1;

      expect(node.foo).toBe("bar");

      let update = {
        nodeId: "id1",
        config: {
          viewRepresentation: {
            required: true,
          },
        },
      };

      store.commit("updateViewConfig", update);

      setTimeout(() => {
        expect(
          store.state.page.wizardPageContent.webNodes.id1.viewRepresentation
            .required,
        ).toBe(false);
      }, 1000);
    });

    // as used in re-execution
    describe("multi-node updates", () => {
      const getPage = () => ({
        wizardPageContent: {
          webNodes: {
            id1: {
              foo: "bar",
            },
            id2: {
              foo: "baz",
            },
            id6: {
              foo: "view_to_be_removed_on_update",
            },
          },
          nodeViews: {
            id3: {
              foo: "qux",
            },
            id4: {
              foo: "grault",
            },
            id5: {
              foo: "view_to_be_removed_on_update",
            },
          },
          webNodePageConfiguration: {
            layout: {
              rows: [
                {
                  columns: [
                    {
                      content: [
                        { nodeID: "id1" },
                        { nodeID: "id2" },
                        { nodeID: "id3" },
                        { nodeID: "id4" },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      });

      const checkPage = (page, webNodeValues, nodeViewValues) => {
        let webNodeIds = Object.keys(page.wizardPageContent.webNodes);
        webNodeValues.forEach((checkValue, nodeIdInd) => {
          expect(
            page.wizardPageContent.webNodes[webNodeIds[nodeIdInd]].foo,
          ).toEqual(checkValue);
        });
        let nodeViewIds = Object.keys(page.wizardPageContent.nodeViews);
        nodeViewValues.forEach((checkValue, nodeIdInd) => {
          expect(
            page.wizardPageContent.nodeViews[nodeViewIds[nodeIdInd]].foo,
          ).toEqual(checkValue);
        });
      };

      beforeEach(() => {
        store.commit("setPage", getPage());
      });

      it("updates single webNode", () => {
        let newPage = getPage();
        newPage.wizardPageContent.webNodes.id1.foo = "qux";
        newPage.wizardPageContent.webNodes.id2.foo = "bar";
        checkPage(store.state.page, ["bar", "baz"], ["qux", "grault"]);
        store.dispatch("updatePage", {
          page: newPage,
          nodeIds: ["id1"],
        });

        setTimeout(() => {
          checkPage(store.state.page, ["qux", "baz"], ["qux", "grault"]);
        }, 1000);
      });

      it("updates multiple webNodes", () => {
        let newPage = getPage();
        newPage.wizardPageContent.webNodes.id1.foo = "qux";
        newPage.wizardPageContent.webNodes.id2.foo = "grault";
        checkPage(store.state.page, ["bar", "baz"], ["qux", "grault"]);
        store.dispatch("updatePage", {
          page: newPage,
          nodeIds: ["id1", "id2"],
        });

        setTimeout(() => {
          checkPage(store.state.page, ["qux", "grault"], ["qux", "grault"]);
        }, 1000);
      });

      it("updates single nodeView", () => {
        let newPage = getPage();
        newPage.wizardPageContent.nodeViews.id3.foo = "bar";
        newPage.wizardPageContent.nodeViews.id4.foo = "baz";
        checkPage(store.state.page, ["bar", "baz"], ["qux", "grault"]);
        store.dispatch("updatePage", {
          page: newPage,
          nodeIds: ["id3"],
        });

        setTimeout(() => {
          checkPage(store.state.page, ["bar", "baz"], ["bar", "grault"]);
        }, 1000);
      });

      it("updates multiple nodeViews", () => {
        let newPage = getPage();
        newPage.wizardPageContent.nodeViews.id3.foo = "bar";
        newPage.wizardPageContent.nodeViews.id4.foo = "baz";
        checkPage(store.state.page, ["bar", "baz"], ["qux", "grault"]);
        store.dispatch("updatePage", {
          page: newPage,
          nodeIds: ["id3", "id4"],
        });

        setTimeout(() => {
          checkPage(store.state.page, ["bar", "baz"], ["bar", "baz"]);
        }, 1000);
      });

      it("updates and removes a combination of webNodes and nodeViews", () => {
        let newPage = getPage();
        newPage.wizardPageContent.webNodes.id1.foo = "qux";
        newPage.wizardPageContent.webNodes.id2.foo = "grault";
        delete newPage.wizardPageContent.webNodes.id6;
        newPage.wizardPageContent.nodeViews.id3.foo = "bar";
        newPage.wizardPageContent.nodeViews.id4.foo = "baz";
        delete newPage.wizardPageContent.nodeViews.id5;
        checkPage(store.state.page, ["bar", "baz"], ["qux", "grault"]);
        expect(store.state.page.wizardPageContent.webNodes.id6).toBeDefined();
        expect(store.state.page.wizardPageContent.nodeViews.id5).toBeDefined();
        store.dispatch("updatePage", {
          page: newPage,
          nodeIds: ["id1", "id3", "id5", "id6"],
        });
        setTimeout(() => {
          checkPage(store.state.page, ["qux", "baz"], ["bar", "grault"]);
          expect(
            store.state.page.wizardPageContent.webNodes.id6,
          ).toBeUndefined();
          expect(
            store.state.page.wizardPageContent.nodeViews.id5,
          ).toBeUndefined();
        }, 1000);
      });

      it("updates selection translators if present in updated page", () => {
        expect(
          interactivityStoreConfig.actions.updateSelectionTranslators,
        ).not.toHaveBeenCalled();
        let newPage = getPage();
        let translators = [
          { sourceID: "foo", targetIDs: ["bar"], forward: true },
        ];
        newPage.wizardPageContent.webNodePageConfiguration = {
          selectionTranslators: translators,
        };
        store.dispatch("updatePage", { page: newPage, nodeIds: [] });
        expect(
          interactivityStoreConfig.actions.updateSelectionTranslators,
        ).toHaveBeenCalledWith(expect.anything(), { translators });
      });

      it("does not dispatch a warning if the layout has not changed", () => {
        expect(alertStoreConfig.actions.showAlert).not.toHaveBeenCalled();
        let newPage = getPage();
        newPage.wizardPageContent.webNodePageConfiguration.layout.rows[0].columns[0].content =
          [{ nodeID: "id1" }];
        store.dispatch("updatePage", { page: newPage, nodeIds: ["id1"] });
        expect(alertStoreConfig.actions.showAlert).not.toHaveBeenCalled();
      });
    });
  });

  describe("node validators", () => {
    it("allows adding validator via action", () => {
      let nodeId = "1.1.1";
      let validator = function () {
        return Promise.resolve(true);
      };
      expect(store.state.pageValidators[nodeId]).toBeUndefined();
      store.dispatch("addValidator", { nodeId, validator });
      expect(store.state.pageValidators[nodeId]).toEqual(validator);
    });

    it("allows removing validator via action", () => {
      let nodeId = "1.1.1";
      let validator = function () {
        return Promise.resolve(true);
      };
      store.dispatch("addValidator", { nodeId, validator });
      expect(store.state.pageValidators[nodeId]).toEqual(validator);
      store.dispatch("removeValidator", { nodeId });
      expect(store.state.pageValidators[nodeId]).toBeUndefined();
    });

    it("allows validating page via action", async () => {
      let nodeId = "1.1.1";
      let validator = function () {
        return Promise.resolve({ nodeId, isValid: true });
      };
      store.dispatch("addValidator", { nodeId, validator });
      let pageValidity = await store.dispatch("getValidity");
      expect(pageValidity).toEqual({ [nodeId]: true });
    });

    it("returns empty object when validation fails", async () => {
      let nodeId = "0.0.7";
      store.dispatch("addValidator", {
        nodeId,
        validator() {
          return Promise.reject(new Error("error"));
        },
      });

      /* eslint-disable-next-line require-await */
      const validity = await muteConsole(async () =>
        store.dispatch("getValidity"),
      );
      expect(validity).toStrictEqual({});
    });
  });

  describe("dirty state management", () => {
    const nodeId = "testNode";
    const initialValue = { foo: "initialValue" };
    const updatedValue = { foo: "updatedValue" };

    beforeEach(() => {
      store = createStore(storeConfig);
      store.commit("setTrackDirtyState", { trackDirtyState: true });
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe("mutation Integration", () => {
      it("auto-adds to clean state when adding value getter", async () => {
        const valueGetter = vi.fn().mockResolvedValue({ value: initialValue });
        await store.dispatch("addValueGetter", { nodeId, valueGetter });

        expect(store.state.cleanViewValuesState[nodeId]).toBe(
          generateUniqueStringFromViewValue(initialValue),
        );
      });

      it("removes from clean state when removing value getter", async () => {
        await store.dispatch("addValueGetter", {
          nodeId,
          valueGetter: vi.fn().mockResolvedValue({ value: initialValue }),
        });
        expect(store.state.cleanViewValuesState[nodeId]).toBe(
          generateUniqueStringFromViewValue(initialValue),
        );

        store.dispatch("removeValueGetter", { nodeId });
        expect(store.state.cleanViewValuesState[nodeId]).toBeUndefined();
      });

      it("logs as debug message on duplicate clean state additions and overwrites the old value", () => {
        const consolaDebug = vi.spyOn(consola, "debug");
        store.commit("addToCleanViewValuesState", {
          nodeId,
          value: initialValue,
        });
        store.commit("addToCleanViewValuesState", {
          nodeId,
          value: updatedValue,
        });

        expect(consolaDebug).toHaveBeenCalled();
        consolaDebug.mockRestore();
      });

      it("warns on duplicate clean state removals", () => {
        const consolaDebug = vi.spyOn(consola, "debug");
        store.commit("removeFromCleanViewValuesState", {
          nodeId: "nodeForWhichNoCleanValueExists",
          value: "notImportant",
        });

        expect(consolaDebug).toHaveBeenCalled();
        consolaDebug.mockRestore();
      });

      it("does not create a clean initial state when loading of web node does not finish", async () => {
        store.commit("setWebNodeLoading", { nodeId, loading: true });

        const valueGetter = vi.fn().mockResolvedValue({ value: initialValue });
        const actionPromise = store.dispatch("addValueGetter", {
          nodeId,
          valueGetter,
        });

        await vi.advanceTimersByTimeAsync(3000);

        await actionPromise;

        expect(store.state.cleanViewValuesState[nodeId]).toBeUndefined();
      });
    });

    describe("isDirty", () => {
      it("returns false when no nodes exist", async () => {
        const isDirty = await store.dispatch("isDirty");
        expect(isDirty).toBe(false);
      });

      it("returns false when values match clean state", async () => {
        const valueGetter = vi.fn().mockResolvedValue({ value: initialValue });

        await store.dispatch("addValueGetter", { nodeId, valueGetter });

        const isDirty = await store.dispatch("isDirty");
        expect(isDirty).toBe(false);
      });

      it("returns true when any node is dirty", async () => {
        let valueGetter = vi
          .fn()
          .mockResolvedValueOnce({ value: initialValue })
          .mockResolvedValue({
            value: updatedValue,
          });
        await store.dispatch("addValueGetter", { nodeId, valueGetter });

        expect(await store.dispatch("isDirty")).toBe(true);
      });

      it("handles missing value getters gracefully", async () => {
        const consolaWarn = vi.spyOn(consola, "debug");
        store.commit("addToCleanViewValuesState", {
          nodeId,
          value: initialValue,
        });

        expect(consolaWarn).not.toHaveBeenCalled();
        const isDirty = await store.dispatch("isDirty");

        expect(isDirty).toBe(false);
        expect(consolaWarn).toHaveBeenCalled();
        consolaWarn.mockRestore();
      });

      it("handles value comparison with different ordering", async () => {
        const valueGetter = vi
          .fn()
          .mockResolvedValueOnce({
            value: { b: 2, a: { c: 3, d: 4 } },
          })
          .mockResolvedValue({
            value: { a: { d: 4, c: 3 }, b: 2 },
          });
        await store.dispatch("addValueGetter", { nodeId, valueGetter });

        const isDirty = await store.dispatch("isDirty");
        expect(isDirty).toBe(false);
      });
    });

    describe("resetDirtyState", () => {
      const pageWithDefaultValue = (defaultValue) => ({
        page: {
          wizardPageContent: {
            webNodes: {
              [nodeId]: {
                viewRepresentation: {
                  defaultValue,
                },
              },
            },
          },
        },
      });

      it("can reset dirty state", async () => {
        const valueGetter = vi
          .fn()
          .mockResolvedValueOnce({ value: initialValue })
          .mockResolvedValue({
            value: updatedValue,
          });

        await store.dispatch("addValueGetter", { nodeId, valueGetter });
        expect(await store.dispatch("isDirty")).toBe(true);

        await store.dispatch("resetDirtyState", { nodeId });
        expect(await store.dispatch("isDirty")).toBe(false);
      });

      it("can infer default values", async () => {
        await store.dispatch("setPage", pageWithDefaultValue(initialValue));
        const valueGetter = vi
          .fn()
          .mockResolvedValueOnce({ value: initialValue })
          .mockResolvedValue({
            value: updatedValue,
          });

        await store.dispatch("addValueGetter", { nodeId, valueGetter });
        expect(await store.dispatch("isDefault")).toBe(false);

        await store.dispatch("setPage", pageWithDefaultValue(updatedValue));
        expect(await store.dispatch("isDefault")).toBe(true);
      });

      it("skips default check if no default value is set", async () => {
        await store.dispatch("setPage", pageWithDefaultValue(undefined));
        const valueGetter = vi.fn().mockResolvedValue({ value: initialValue });

        await store.dispatch("addValueGetter", { nodeId, valueGetter });
        expect(await store.dispatch("isDefault")).toBe(true);
      });

      it("handles async value fetching errors", () => {
        const errorGetter = vi.fn().mockRejectedValue(new Error("Async error"));
        muteConsole(async () => {
          const consolaWarn = vi.spyOn(consola, "warn");
          await store.dispatch("addValueGetter", {
            nodeId,
            valueGetter: errorGetter,
          });
          await store.dispatch("resetDirtyState", { nodeId });
          expect(consolaWarn).toHaveBeenCalled();
          consolaWarn.mockRestore();
        });
      });
    });
  });
});
