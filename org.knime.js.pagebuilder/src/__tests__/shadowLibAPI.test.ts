import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createPageBuilderApp } from "@/shadowAppAPI";

const mockDispatch = vi.hoisted(() => vi.fn());
let storeConfig: any = vi.hoisted(() => null);

const mockCreateStore = vi.hoisted(() =>
  vi.fn().mockImplementation((config) => {
    storeConfig = config;
    return {
      dispatch: mockDispatch,
      state: {
        pagebuilder: {
          page: null,
        },
      },
    };
  }),
);

vi.mock("vuex", async (importOriginal) => {
  const original = (await importOriginal()) as any;
  return {
    ...original,
    createStore: mockCreateStore,
  };
});

const mockUnmount = vi.hoisted(() => vi.fn());
const mockApp = vi.hoisted(() => ({
  mount: vi.fn(),
  unmount: mockUnmount,
  use: vi.fn(),
}));

vi.mock("vue", async (importOriginal) => {
  const original = (await importOriginal()) as any;
  return {
    ...original,
    createApp: () => mockApp,
  };
});

describe("createPageBuilderApp", () => {
  const validStoreConfig = {
    namespaced: true,
    actions: {
      mount: vi.fn(),
      onChange: vi.fn(),
    },
  };

  beforeEach(() => {
    // @ts-ignore
    global.__INLINE_CSS_CODE__ = "/* mock CSS */";
    vi.clearAllMocks();
  });

  afterEach(() => {
    // @ts-ignore
    delete global.__INLINE_CSS_CODE__;
  });

  it("throws error when missing mount action", async () => {
    await expect(
      createPageBuilderApp({ namespaced: true, actions: {} }, ""),
    ).rejects.toThrow("Invalid store configuration");
  });

  it("throws error when missing onChange action", async () => {
    await expect(
      createPageBuilderApp(
        { namespaced: true, actions: { mount: vi.fn() } },
        "",
      ),
    ).rejects.toThrow("Invalid store configuration");
  });

  it("registers all required modules", async () => {
    await createPageBuilderApp(validStoreConfig, "");
    expect(storeConfig.modules).toMatchObject({
      api: validStoreConfig,
      pagebuilder: expect.anything(),
      "pagebuilder/interactivity": expect.anything(),
      wizardExecution: expect.anything(),
    });
  });

  const mountAndGetValidControl = async () => {
    const shadowRoot = document
      .createElement("div")
      .attachShadow({ mode: "open" });
    const control = await createPageBuilderApp(validStoreConfig, "");
    control.mountShadowApp(shadowRoot);
    return { control, shadowRoot };
  };

  it("prevents double mounting", async () => {
    const { control, shadowRoot } = await mountAndGetValidControl();
    expect(mockApp.mount).toHaveBeenCalledTimes(1);

    control.unmountShadowApp();
    control.mountShadowApp(shadowRoot);

    expect(mockApp.mount).toHaveBeenCalledTimes(1);
  });

  it("injects styles correctly", async () => {
    const { shadowRoot } = await mountAndGetValidControl();

    expect(shadowRoot.querySelector("style")?.textContent).toBe(
      "/* mock CSS */",
    );
  });

  it("dispatches api/mount with correct parameters", async () => {
    const { control } = await mountAndGetValidControl();

    const testIdentifiers = {
      projectId: "pid",
      workflowId: "wid",
      nodeId: "nid",
    };

    await control.loadPage(
      testIdentifiers.projectId,
      testIdentifiers.workflowId,
      testIdentifiers.nodeId,
    );
    expect(mockDispatch).toHaveBeenCalledWith("api/mount", testIdentifiers);
  });

  it("dispatches pagebuilder/isDirty", async () => {
    const { control } = await mountAndGetValidControl();

    mockDispatch.mockResolvedValue(true);
    const result = await control.isDirty();
    expect(result).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith("pagebuilder/isDirty");
  });

  it("dispatches api/triggerReExecution", async () => {
    const { control } = await mountAndGetValidControl();

    await control.updateAndReexecute();
    expect(mockDispatch).toHaveBeenCalledWith("api/triggerReExecution", {});
  });

  it("dispatches api/applyAsDefault", async () => {
    const { control } = await mountAndGetValidControl();

    await control.applyToDefaultAndExecute();
    expect(mockDispatch).toHaveBeenCalledWith("api/applyAsDefault", {});
  });

  it("returns false when no page exists", async () => {
    const { control } = await mountAndGetValidControl();

    expect(control.hasPage()).toBe(false);
  });

  it("returns true when page has content", async () => {
    mockCreateStore.mockImplementationOnce(() => ({
      dispatch: mockDispatch,
      state: {
        pagebuilder: {
          page: { wizardPageContent: "content" },
        },
      },
    }));
    const controlWithPage = await createPageBuilderApp(validStoreConfig, "");
    expect(controlWithPage.hasPage()).toBe(true);
  });

  it("calls Vue unmount method", async () => {
    const { control } = await mountAndGetValidControl();

    control.unmountShadowApp();
    expect(mockUnmount).toHaveBeenCalled();
  });
});
