import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import loadErrorHandlerSrc from "@/components/views/injectedScripts/loadErrorHandler?raw";

describe("load error handler", () => {
  beforeAll(() => {
    vi.spyOn(window, "postMessage").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete window.onerror;
  });

  it("defines the onerror function", () => {
    eval(loadErrorHandlerSrc);
    expect(typeof window.onerror).toBe("function");
  });

  it("handles only load timout errors", () => {
    expect(window.postMessage).not.toHaveBeenCalled();
    eval(loadErrorHandlerSrc);

    try {
      throw new Error("Random error");
    } catch (err) {
      window.onerror(err);
    }
    expect(window.postMessage).not.toHaveBeenCalled();

    try {
      throw new Error("load timeout");
    } catch (err) {
      window.onerror(err);
    }
    expect(window.postMessage).toHaveBeenCalledWith(
      {
        isValid: false,
        nodeId: "%NODEID%",
        error: "Required web resources timed out and could not be loaded.",
        type: "error",
      },
      "%ORIGIN%",
    );
  });
});
