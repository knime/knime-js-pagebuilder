import { expect, describe, beforeAll, afterEach, it, vi } from "vitest";
import knimeLoaderSrc from "@/components/views/injectedScripts/scriptLoader?raw";

describe("script loader", () => {
  beforeAll(() => {
    vi.spyOn(window, "postMessage").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete window.knimeLoader;
  });

  it("defines the global knimeLoader function", () => {
    eval(knimeLoaderSrc);
    expect(typeof window.knimeLoader).toBe("function");
  });

  it("handles success", () => {
    expect(window.postMessage).not.toHaveBeenCalled();
    eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 2));

    window.knimeLoader(true);
    window["%NAMESPACE%"] = { fakeView: true };
    window.knimeLoader(true);

    expect(window.postMessage).toHaveBeenCalledWith(
      { nodeId: "%NODEID%", type: "load" },
      "%ORIGIN%",
    );
    delete window["%NAMESPACE%"];
  });

  it("handles load errors", () => {
    const message = "Script could not be loaded";
    eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 100));

    window.knimeLoader(true);
    expect(() => window.knimeLoader(false)).toThrowError(new Error(message));

    expect(window.postMessage).toHaveBeenCalledWith(
      {
        nodeId: "%NODEID%",
        error: message,
        type: "load",
      },
      "%ORIGIN%",
    );
  });

  it("handles successful load with missing view", () => {
    const message = "No view found under namespace %NAMESPACE%";
    eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 2));

    window.knimeLoader(true);
    expect(() => window.knimeLoader(true)).toThrowError(
      new ReferenceError(message),
    );

    expect(window.postMessage).toHaveBeenCalledWith(
      {
        nodeId: "%NODEID%",
        error: message,
        type: "load",
      },
      "%ORIGIN%",
    );
  });

  it("handles empty script list", () => {
    expect(window.postMessage).not.toHaveBeenCalled();
    eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 0));

    expect(window.postMessage).toHaveBeenCalledWith(
      { nodeId: "%NODEID%", type: "load" },
      "%ORIGIN%",
    );
  });
});
