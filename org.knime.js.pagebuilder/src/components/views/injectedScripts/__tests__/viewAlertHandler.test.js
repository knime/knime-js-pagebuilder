import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import viewAlertHandlerSrc from "@/components/views/injectedScripts/viewAlertHandler?raw";

describe("view alert handler", () => {
  beforeAll(() => {
    vi.spyOn(window, "postMessage").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete window.alert;
  });

  it("defines the window.alert function", () => {
    expect(typeof window.alert).toBe("function");
    delete window.alert;
    expect(typeof window.alert).toBe("undefined");
    eval(viewAlertHandlerSrc);
    expect(typeof window.alert).toBe("function");
  });

  it("handles in view error alerts", () => {
    expect(window.postMessage).not.toHaveBeenCalled();
    eval(viewAlertHandlerSrc);

    let message = "Error: undefined";

    window.alert(message);

    expect(window.postMessage).toHaveBeenCalledWith(
      {
        nodeId: "%NODEID%",
        message,
        type: "alert",
        level: "error",
      },
      "%ORIGIN%",
    );
  });

  it("handles in view warnings and info alerts", () => {
    expect(window.postMessage).not.toHaveBeenCalled();
    eval(viewAlertHandlerSrc);

    let message = "Some non-critical message.";

    window.alert(message);

    expect(window.postMessage).toHaveBeenCalledWith(
      {
        nodeId: "%NODEID%",
        message,
        type: "alert",
        level: "info",
      },
      "%ORIGIN%",
    );
  });
});
