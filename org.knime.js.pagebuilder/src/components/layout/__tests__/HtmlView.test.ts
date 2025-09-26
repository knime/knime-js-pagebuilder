import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { sanitization } from "@knime/utils";

import HtmlView from "../HtmlView.vue";

vi.mock("@knime/utils", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    // @ts-ignore
    ...actual,
    sanitization: { sanitizeHTML: vi.fn(), stripHTML: vi.fn() },
  };
});

describe("HtmlView", () => {
  it("sanitizes before render", () => {
    const value = "<h1>Hello world</h1>";
    mount(HtmlView, { props: { value } });
    expect(sanitization.sanitizeHTML).toHaveBeenCalledWith(value);
  });
});
