import { onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";
import { getMetaOrCtrlKey } from "webapps-common/util/navigator";

const doIfBodyActive =
  (fn: (event: KeyboardEvent) => void) => (event: KeyboardEvent) => {
    if (event.target === document.body) {
      fn(event);
    }
  };

export default () => {
  const isMetaKeyPressed = ref(false);
  const close = () => window.closeCEFWindow(isMetaKeyPressed.value);
  const store = useStore();
  const applyAndClose = async () => {
    await store.dispatch("pagebuilder/dialog/callApplySettings");
    close();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    isMetaKeyPressed.value = e[getMetaOrCtrlKey()];
    if (e.defaultPrevented) {
      return;
    }
    if (e.key === "Enter") {
      applyAndClose();
    }
    if (e.key === "Escape") {
      close();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    isMetaKeyPressed.value = e[getMetaOrCtrlKey()];
  };
  onMounted(() => {
    window.addEventListener("keyup", doIfBodyActive(onKeyUp));
    window.addEventListener("keydown", doIfBodyActive(onKeyDown));
  });

  onUnmounted(() => {
    window.removeEventListener("keyup", doIfBodyActive(onKeyUp));
  });

  return { close, applyAndClose, onKeyDown, onKeyUp, isMetaKeyPressed };
};
