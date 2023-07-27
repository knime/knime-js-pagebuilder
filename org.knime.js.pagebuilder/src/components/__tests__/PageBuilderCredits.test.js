import { expect, describe, it } from "vitest";
import PageBuilderCredits from "@/components/PageBuilderCredits.vue";
import packages from "webapps-common/buildtools/opensourcecredits/used-packages.json";

describe("PageBuilderCredits.vue", () => {
  it("has packages", () => {
    expect(PageBuilderCredits.packages).toStrictEqual(packages);
  });
});
