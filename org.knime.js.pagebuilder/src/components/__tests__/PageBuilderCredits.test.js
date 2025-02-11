import { describe, expect, it } from "vitest";

import packages from "@@/licenses/used-packages.json";
import PageBuilderCredits from "@/components/PageBuilderCredits.vue";

describe("PageBuilderCredits.vue", () => {
  it("has packages", () => {
    expect(PageBuilderCredits.packages).toStrictEqual(packages);
  });
});
