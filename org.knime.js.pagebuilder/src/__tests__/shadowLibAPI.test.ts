import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createPageBuilderApp } from "@/shadowAppAPI";

describe("getPageBuilderControl", () => {
  beforeEach(() => {
    // @ts-ignore
    global.__INLINE_CSS_CODE__ = "/* some CSS code */";
  });

  afterEach(() => {
    // @ts-ignore
    delete global.__INLINE_CSS_CODE__;
  });

  it("mounts Vue app inside shadow root with store and styles", async () => {
    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });

    const control = await createPageBuilderApp(
      {
        namespaced: true,
        actions: {
          mount: () => {},
        },
      },
      "",
    );

    expect(control).toBeDefined();
    control.mountShadowApp(shadowRoot);

    const container = shadowRoot.querySelector("div");
    expect(container).toBeDefined();

    const style = shadowRoot.querySelector("style");
    expect(style).toBeDefined();
    expect(style !== null).toBeTruthy();
    expect(style!.textContent).toBe("/* some CSS code */");

    expect(container!.querySelector("PageBuilder")).toBeDefined();
  });
});
