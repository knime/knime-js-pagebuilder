import { beforeAll, describe, expect, it } from "vitest";
import { shallowMount } from "@vue/test-utils";

import { Label } from "@knime/components";

import NotDisplayable from "@/components/views/NotDisplayable.vue";

describe("NotDisplayable.vue", () => {
  let wrapper;

  beforeAll(() => {
    wrapper = shallowMount(NotDisplayable);
  });

  it("renders default", () => {
    expect(wrapper.findComponent(Label).props("text")).toBe(
      "Missing node () can’t be displayed",
    );
    expect(wrapper.find("span").text()).toContain(
      "No further information available",
    );
  });

  it("renders error message", () => {
    wrapper = shallowMount(NotDisplayable, {
      props: {
        nodeInfo: {
          nodeName: "testName",
          nodeErrorMessage: "test_error",
        },
      },
    });
    expect(wrapper.find("span").text()).toContain("test_error");
  });

  it("renders warn message", () => {
    wrapper = shallowMount(NotDisplayable, {
      props: {
        nodeInfo: {
          nodeName: "testName",
          nodeWarnMessage: "test_warning",
        },
      },
    });
    expect(wrapper.find("span").text()).toContain("test_warning");
  });

  it("renders annotation", () => {
    wrapper = shallowMount(NotDisplayable, {
      props: {
        nodeInfo: {
          nodeName: "testName",
          nodeAnnotation: "test_annotation",
          nodeErrorMessage: "test_error",
        },
        nodeId: "10.0.2",
      },
    });
    expect(wrapper.findComponent(Label).props("text")).toBe(
      "testName - test_annotation (10.0.2) can’t be displayed",
    );
  });

  it("hides content via prop from parent", async () => {
    await wrapper.setProps({ showError: false });
    expect(wrapper.findComponent(Label).exists()).toBe(false);
    expect(wrapper.find("span").exists()).toBe(false);
  });
});
