import { describe, expect, it } from "vitest";

import wrapViewContent from "@/util/wrapViewContent";

const localWrapView = (item) => ({
  type: "JSONLayoutRow",
  additionalStyles: [],
  additionalClasses: [],
  columns: [
    {
      content: [item],
      widthXS: 12,
      additionalStyles: [],
      additionalClasses: [],
    },
  ],
});

describe("wrapViewContent util", () => {
  it("handles empty content", () => {
    expect(wrapViewContent([])).toStrictEqual([]);
  });

  it("does not wrap single views", () => {
    let originalContent = [
      {
        type: "view",
      },
    ];
    expect(wrapViewContent(originalContent)).toStrictEqual(originalContent);
  });

  it("wraps views of different types", () => {
    let originalContent = [
      {
        type: "view",
      },
      {
        type: "JSONLayoutViewContent",
      },
    ];
    expect(wrapViewContent(originalContent)).toStrictEqual([
      localWrapView(originalContent[0]),
      localWrapView(originalContent[1]),
    ]);
  });

  it("wraps only views even when configured with other content", () => {
    let originalContent = [
      {
        type: "view",
      },
      {
        type: "row",
      },
      {
        type: "JSONNestedLayout",
      },
      {
        type: "JSONLayoutViewContent",
      },
    ];
    expect(wrapViewContent(originalContent)).toStrictEqual([
      localWrapView(originalContent[0]),
      originalContent[1],
      originalContent[2],
      localWrapView(originalContent[3]),
    ]);
  });
});
