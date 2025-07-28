import { describe, expect, it } from "vitest";

import PageBuilderCredits from "@/components/PageBuilderCredits.vue";
import packages from "../../../licenses/used-packages.json";

describe("PageBuilderCredits.vue", () => {
  it("has packages", () => {
    expect(PageBuilderCredits.packages).toStrictEqual(packages);
  });
});
