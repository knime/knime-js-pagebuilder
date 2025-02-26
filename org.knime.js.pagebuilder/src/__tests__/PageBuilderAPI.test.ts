import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStore } from "vuex";

import { createShadowApp, initStore } from "@/PageBuilderAPI";

describe("createShadowApp", () => {
  beforeEach(() => {
    // @ts-ignore
    global.__INLINE_CSS_CODE__ = "/* some CSS code */";
  });

  afterEach(() => {
    // @ts-ignore
    delete global.__INLINE_CSS_CODE__;
  });

  it("mounts Vue app inside shadow root with store and styles", () => {
    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });

    const mockStore = createStore({});
    initStore(mockStore);
    const shadowApp = createShadowApp(shadowRoot, mockStore);

    expect(shadowApp).toBeDefined();

    const container = shadowRoot.querySelector("div");
    expect(container).toBeDefined();

    const style = shadowRoot.querySelector("style");
    expect(style).toBeDefined();
    expect(style !== null).toBeTruthy();
    expect(style!.textContent).toBe("/* some CSS code */");

    expect(container!.querySelector("PageBuilder")).toBeDefined();
  });
});
