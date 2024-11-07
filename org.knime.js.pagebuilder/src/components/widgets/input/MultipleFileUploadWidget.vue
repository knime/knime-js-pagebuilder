<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Label, Dropzone } from "@knime/components";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";
import { getFileExtension } from "../../../util/fileUtils";
import { useStore } from "vuex";

const DATA_TYPE = "path";

interface Props {
  nodeConfig: {
    nodeInfo: any;
    viewRepresentation: any;
  };
  nodeId: string;
  alignment?: "horizontal" | "vertical";
  isValid?: boolean;
  valuePair?: {
    path?: string;
    fileName?: string;
    [key: string]: any;
  };
  errorMessage?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  alignment: "horizontal",
  isValid: true,
  valuePair: () => ({ [DATA_TYPE]: "" }),
  errorMessage: null,
});

const emit = defineEmits<{
  (
    event: "updateWidget",
    payload: {
      nodeId: string;
      type: string;
      update: Record<string, any>;
    },
  ): void;
}>();

// State
const store = useStore();
const uploadAPI = ref<any>(null);
const uploadProgress = ref(0);
const uploading = ref(false);
const uploadErrorMessage = ref<string | null>(null);
const initialized = ref(false);
const localFileName = ref<string | null>(null);
const localFileSize = ref<number | null>(null);
// const input = ref<HTMLInputElement | null>(null);

// Computed
const viewRep = computed(() => props.nodeConfig.viewRepresentation);
const label = computed(() => viewRep.value.label as string);
const description = computed(() => viewRep.value.description as string);
const multiple = computed(() => viewRep.value.multiple as boolean);
const fileTypes = computed(() => viewRep.value.fileTypes as string[]);
// const disabled = computed(() => false); // option not needed right now, for later use
const path = computed(() => props.valuePair?.path);
const fileName = computed(
  () => props.valuePair?.fileName || localFileName.value || "No file selected.",
);

/* const fileSize = computed(() => {
  if (!localFileSize.value) {
    return null;
  }
  return partial({
    output: "object",
  })(localFileSize.value);
});

const progressStyle = computed(() =>
  isNaN(uploadProgress.value) ? "width:0%;" : `width:${uploadProgress.value}%;`,
);

const uploadManagerResult = useUploadManager({
  prepareUpload: { parentId: "", files: [] },
});

consola.info("uploadManagerResult", uploadManagerResult);

*/

// Methods
const setUploadProgress = (progress: number) => {
  uploadProgress.value = progress;
};

const dropzoneHeight = computed(() => {
  return multiple.value ? "160px" : "92px";
});

const layout = computed(() => {
  return multiple.value ? "vertical" : "horizontal";
});

const validate = () => {
  let isValid = true;
  let errorMessage = null;

  if (!uploadAPI.value) {
    return { isValid };
  }

  if (fileTypes.value?.length && fileName.value) {
    isValid = fileTypes.value
      ?.map((type: string) => type?.toLowerCase())
      .includes(`.${getFileExtension(fileName.value)?.toLowerCase()}`);

    if (!isValid) {
      errorMessage =
        "The type of the selected file does not match the allowed file " +
        `types (${fileTypes.value.join(", ")}).`;
    }
  }

  if (!initialized.value) {
    initialized.value = true;
    return { isValid, errorMessage };
  }

  if (uploading.value) {
    isValid = false;
    errorMessage = "Upload still in progress.";
  } else if (!path.value) {
    isValid = false;
    errorMessage = "Input is required.";
  }

  return {
    isValid,
    errorMessage: isValid ? null : errorMessage,
  };
};

/* const triggerInput = () => {
  input.value?.click();
};

const abortUpload = () => {
  store.getters["api/cancelUploadResource"]({ nodeId: props.nodeId });
}; */

const onChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target) {
    return null;
  }

  const file = target.files?.[0];
  if (!file) {
    return null;
  }

  uploading.value = true;
  uploadErrorMessage.value = null;
  localFileName.value = file.name;
  localFileSize.value = file.size;

  if (window?.KnimePageLoader) {
    const reader = new FileReader();
    reader.onload = (res) => {
      setUploadProgress(100);
      emit("updateWidget", {
        nodeId: props.nodeId,
        type: DATA_TYPE,
        update: {
          "viewRepresentation.currentValue.path": res.target?.result as string,
          "viewRepresentation.currentValue.fileName": localFileName.value,
        },
      });
      uploading.value = false;
    };
    reader.readAsDataURL(file);
    return null;
  }

  const { response, errorResponse } = await uploadAPI.value({
    nodeId: props.nodeId,
    resource: file,
    progressCallback: setUploadProgress,
    context: getCurrentInstance(),
  });

  if (errorResponse) {
    uploading.value = false;
    uploadErrorMessage.value = errorResponse.cancelled
      ? "Upload cancelled."
      : "Upload failed.";
    localFileName.value = null;
    localFileSize.value = null;
    return null;
  }

  emit("updateWidget", {
    nodeId: props.nodeId,
    type: DATA_TYPE,
    update: {
      "viewRepresentation.currentValue.path": response.location,
      "viewRepresentation.currentValue.fileName": localFileName.value,
    },
  });
  uploading.value = false;
  return null;
};

// Lifecycle
onMounted(() => {
  uploadAPI.value = store.getters["api/uploadResource"];
});

defineExpose({
  validate,
  onChange,
});
</script>

<template>
  <div :class="alignment" :title="description">
    <Label :text="label" large>
      <div class="upload-wrapper">
        <Dropzone
          label-text="Choose files or drop here"
          :supported-formats="fileTypes"
          :layout="layout"
          :style="{ height: dropzoneHeight }"
        />
      </div>
    </Label>
    <ErrorMessage :error="uploadErrorMessage || errorMessage" />
  </div>
</template>

<style lang="postcss" scoped>
p {
  font-size: 13px;
  line-height: 18px;
  margin: 0;
  margin-top: 10px;
  display: flex;
  align-items: center;
  word-break: break-word;

  &.disabled {
    opacity: 0.5;
  }

  & svg {
    width: 16px;
    height: 16px;
    stroke-width: calc(32px / 16);
    stroke: var(--theme-color-success);
    margin-left: 5px;
    flex-shrink: 0;
  }
}

input {
  user-select: none;
  display: flex;
  opacity: 0;
  position: absolute;
  z-index: -1;
}

.progress-bar-wrapper {
  opacity: 0;
  width: 50%;
  display: flex;
  align-items: flex-start;
  margin-top: 10px;
  height: 10px;
  border-radius: var(--theme-slider-border-radius);
  position: relative;
  transition: opacity linear 0.3s 0.3s;

  &.show-bar {
    opacity: 1;
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    height: 1px;
    background: var(--knime-silver-sand);
    width: 100%;
    display: block;
  }

  & .progress-bar {
    height: 100%;
    background-color: var(--theme-slider-background-color);
    max-width: 100%;
    border-radius: var(--theme-slider-border-radius);
    transition: width 0.5s;
    z-index: 1;

    & span {
      font-size: 13px;
      line-height: 18px;
      top: -3px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      text-shadow: 0 0 var(--knime-white);
    }
  }
}

.horizontal {
  & .upload-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    & p {
      margin-left: 10px;
      margin-top: 0;
    }
  }
}
</style>
