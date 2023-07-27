import { expect, describe, it } from "vitest";
import { createTicks } from "@/util/widgetUtil/slider/tickUtil";

describe("tickUtil.js", () => {
  it("handles missing config", () => {
    const tickConfig = {
      min: 1,
      max: 100,
      direction: "ltr",
    };

    expect(createTicks(tickConfig)).toEqual({});
  });

  it("handles empty ticks", () => {
    const tickConfig = {
      config: {
        mode: "",
      },
      min: 1,
      max: 100,
      direction: "ltr",
    };

    expect(createTicks(tickConfig)).toEqual({});
  });

  it("handles step ticks", () => {
    const tickConfig = {
      config: {
        mode: "steps",
        format: {
          negative: "-",
          decimals: 2,
          mark: ".",
        },
      },
      min: 0,
      max: 100,
      direction: "ltr",
      stepSize: 25,
    };

    expect(createTicks(tickConfig)).toEqual({
      0: "0.00",
      25: "25.00",
      50: "50.00",
      75: "75.00",
      100: "100.00",
    });
  });

  it("handles count ticks", () => {
    const NUM_TICKS = 4;
    const tickConfig = {
      config: {
        mode: "count",
        format: {
          negative: "-",
          decimals: 2,
          mark: ".",
        },
        values: [NUM_TICKS],
      },
      min: 0,
      max: 100,
      direction: "ltr",
    };

    expect(createTicks(tickConfig)).toEqual({
      0: "0.00",
      25: "25.00",
      50: "50.00",
      75: "75.00",
      100: "100.00",
    });
  });

  it("handles values ticks", () => {
    const val1 = 1;
    const val2 = 50;
    const val3 = 100;
    const tickConfig = {
      config: {
        mode: "values",
        format: {
          negative: "-",
          decimals: 2,
          mark: ".",
        },
        values: [val1, val2, val3],
      },
      min: 1,
      max: 100,
      direction: "ltr",
    };

    expect(createTicks(tickConfig)).toEqual({
      1: "1.00",
      50: "50.00",
      100: "100.00",
    });
  });

  it("handles range ticks", () => {
    const tickConfig = {
      config: {
        mode: "range",
        format: {
          negative: "-",
          decimals: 2,
          mark: ".",
        },
      },
      min: 1,
      max: 100,
      direction: "ltr",
    };

    expect(createTicks(tickConfig)).toEqual({
      1: "1.00",
      100: "100.00",
    });
  });

  it("handles density only ticks", () => {
    const tickConfig = {
      config: {
        density: 25,
      },
      min: 0,
      max: 100,
      direction: "ltr",
    };

    expect(createTicks(tickConfig)).toEqual({
      0: {
        label: "",
        labelStyle: {
          display: "none",
        },
        style: {
          height: "10px !important",
        },
      },
      25: {
        label: "",
        labelStyle: {
          display: "none",
        },
        style: {
          height: "5px !important",
        },
      },
      50: {
        label: "",
        labelStyle: {
          display: "none",
        },
        style: {
          height: "8px !important",
        },
      },
      75: {
        label: "",
        labelStyle: {
          display: "none",
        },
        style: {
          height: "5px !important",
        },
      },
      100: {
        label: "",
        labelStyle: {
          display: "none",
        },
        style: {
          height: "10px !important",
        },
      },
    });
  });

  it("handles PIP steps only", () => {
    const tickConfig = {
      config: {
        mode: "steps",
        density: 50,
        format: {
          negative: "-",
          decimals: 2,
          mark: ".",
        },
      },
      min: 0,
      max: 100,
      direction: "ltr",
      hasSteps: false,
    };

    expect(createTicks(tickConfig)).toEqual({
      0: "0",
      100: "100",
      50: {
        label: "",
        labelStyle: {
          display: "none",
        },
        style: {
          height: "5px !important",
        },
      },
    });
  });
});
