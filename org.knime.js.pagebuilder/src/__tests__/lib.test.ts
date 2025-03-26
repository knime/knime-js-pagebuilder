import { describe, expect, it } from "vitest";

describe("lib.js exports", () => {
  it("should export PageBuilder with correct properties", async () => {
    const { PageBuilder } = await import("../lib");

    expect(PageBuilder).toBeDefined();
    expect(PageBuilder.__name).toBe("PageBuilder");

    expect(PageBuilder.initStore).toBeDefined();
    expect(PageBuilder.initStore).toBeInstanceOf(Function);

    expect(PageBuilder.render).toBeInstanceOf(Function);
    expect(PageBuilder.setup).toBeInstanceOf(Function);
  });
});
