import { mount, type VueWrapper } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import DialogControls from "../DialogControls.vue";
import { Button } from "@knime/components";

describe("DialogControls", () => {
  let wrapper: VueWrapper<any, any>,
    props: { isMetaKeyPressed: boolean; isWriteProtected?: boolean };

  beforeEach(() => {
    props = {
      isMetaKeyPressed: false,
    };
    wrapper = mount(DialogControls, { props });
  });

  it("has a 'Cancel' and an 'Ok' button", () => {
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons).toHaveLength(2);
    expect(buttons.at(0)?.text()).toBe("Cancel");
    expect(buttons.at(1)?.text()).toBe("Ok");
  });

  it("emits 'cancel' on 'Cancel' click", async () => {
    await wrapper.findAllComponents(Button).at(0)?.trigger("click");
    expect(wrapper.emitted("cancel")).toBeDefined();
  });

  it("emits 'ok' on 'Ok' click", async () => {
    await wrapper.findAllComponents(Button).at(1)?.trigger("click");
    expect(wrapper.emitted("ok")).toBeDefined();
  });

  it("displays 'Ok and Execute' instead of 'Ok' if isMetaKeyPressed is true", () => {
    props = {
      isMetaKeyPressed: true,
    };
    wrapper = mount(DialogControls, { props });
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons.at(1)?.text()).toBe("Ok and Execute");
  });

  it("disables 'Ok'button if isWriteProtected", () => {
    props.isWriteProtected = true;
    wrapper = mount(DialogControls, { props });
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons.at(1)?.attributes().disabled).toBeDefined();
  });
});
