import { onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";
import { navigatorUtils } from "@knime/utils";

const doIfBodyActive =
  (fn: (event: KeyboardEvent) => void) => (event: KeyboardEvent) => {
    if (event.target === document.body) {
      fn(event);
    }
  };

export default () => {
  const isMetaKeyPressed = ref(false);
  const close = (params?: { executeNode: boolean }) =>
    window.closeCEFWindow(params?.executeNode ?? false);
  const store = useStore();
  const applyAndClose = async () => {
    const { isApplied } = await store.dispatch(
      "pagebuilder/dialog/callApplySettings",
    );
    if (isApplied) {
      close({ executeNode: isMetaKeyPressed.value });
    }
  };
  const onKeyDown = (e: KeyboardEvent) => {
    isMetaKeyPressed.value = e[navigatorUtils.getMetaOrCtrlKey()];
    if (e.defaultPrevented) {
      return;
    }
    if (isMetaKeyPressed.value && e.key === "Enter") {
      applyAndClose();
    }
    if (e.key === "Escape") {
      close();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    isMetaKeyPressed.value = e[navigatorUtils.getMetaOrCtrlKey()];
  };
  onMounted(() => {
    window.addEventListener("keyup", doIfBodyActive(onKeyUp));
    window.addEventListener("keydown", doIfBodyActive(onKeyDown));
  });

  onUnmounted(() => {
    window.removeEventListener("keyup", doIfBodyActive(onKeyUp));
    window.removeEventListener("keydown", doIfBodyActive(onKeyDown));
  });

  return { close, applyAndClose, onKeyDown, onKeyUp, isMetaKeyPressed };
};
