<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { v4 as uuid } from "uuid";

declare global {
  interface Window {
    KnimePageLoader?: any;
  }
}
import {
  Label,
  Dropzone,
  UploadItem,
  UploadItemStatus,
  ProgressList,
  UploadProgressPanelItem,
} from "@knime/components";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";
import { useStore } from "vuex";

const DATA_TYPE = "path";

const FILE_UPLOAD_OBJECT_IDENTIFIER =
  "org.knime.js.base.node.base.input.fileupload.FileUploadObject";

interface FileValue {
  "@class": typeof FILE_UPLOAD_OBJECT_IDENTIFIER;
  id: string;
  path: string;
  fileName: string;
  fileSize: number;
}

const createFileValue = (data: Omit<FileValue, "@class">): FileValue => ({
  "@class": FILE_UPLOAD_OBJECT_IDENTIFIER,
  ...data,
});

const UploadState: { [key in UploadItemStatus]: UploadItemStatus } = {
  inprogress: "inprogress",
  cancelled: "cancelled",
  failed: "failed",
  complete: "complete",
} as const;

interface Props {
  nodeConfig: {
    nodeInfo: any;
    viewRepresentation: any;
  };
  nodeId: string;
  alignment?: "horizontal" | "vertical";
  isValid?: boolean;
  valuePair?: {
    files?: FileValue[];
    [key: string]: any;
  };
  errorMessage?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  alignment: "horizontal",
  isValid: true,
  valuePair: () => ({ files: [] }),
  errorMessage: null,
});

const uploadItems = ref<UploadItem[]>([]);

const isUploading = computed(() =>
  uploadItems.value.some((item) => item.status === UploadState.inprogress),
);

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
const uploadErrorMessage = ref<string | null>(null);
const initialized = ref(false);

// Computed
const viewRep = computed(() => props.nodeConfig.viewRepresentation);
const label = computed(() => viewRep.value.label as string);
const description = computed(() => viewRep.value.description as string);
const multiple = computed(() => viewRep.value.multiple as boolean);
const fileTypes = computed(() => viewRep.value.fileTypes as string[]);
const required = computed(() => viewRep.value.required as boolean);
const disabled = computed(() => viewRep.value.disabled as boolean);
const empty = computed(() => uploadItems.value.length === 0);
const files = computed(() => props.valuePair?.files as FileValue[]);

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
/* const setUploadProgress = (progress: number) => {
  uploadProgress.value = progress;
}; */

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

  // if (fileTypes.value?.length && fileName.value) {
  //   isValid = fileTypes.value
  //     ?.map((type: string) => type?.toLowerCase())
  //     .includes(`.${getFileExtension(fileName.value)?.toLowerCase()}`);

  //   if (!isValid) {
  //     errorMessage =
  //       "The type of the selected file does not match the allowed file " +
  //       `types (${fileTypes.value.join(", ")}).`;
  //   }
  // }

  if (!initialized.value) {
    initialized.value = true;
    return { isValid, errorMessage };
  }

  if (isUploading.value) {
    isValid = false;
    errorMessage = "Upload still in progress.";
  } else if (required.value && !files.value?.length) {
    isValid = false;
    errorMessage = "File is required.";
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

const onUploadComplete = (item: UploadItem, path: string) => {
  const newFileValue: FileValue[] = [];
  if (multiple.value) {
    newFileValue.push(...files.value);
  }
  newFileValue.push(
    createFileValue({
      id: item.id,
      fileName: item.name,
      path,
      fileSize: item.size,
    }),
  );
  emit("updateWidget", {
    nodeId: props.nodeId,
    type: DATA_TYPE,
    update: {
      "viewRepresentation.currentValue.files": newFileValue,
    },
  });
};

const onRemove = (item: UploadItem) => {
  // TODO: delete from API?
  const index = uploadItems.value.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    uploadItems.value.splice(index, 1);
  }
};

const onCancel = (item: UploadItem) => {
  const index = uploadItems.value.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    uploadItems.value[index].status = UploadState.cancelled;
    uploadItems.value[index].progress = 0;
  }
};

const onFileAdded = (file: File) => {
  const uploadItem: UploadItem = {
    id: uuid(),
    name: file.name,
    size: file.size,
    progress: 1,
    status: UploadState.inprogress,
  };
  uploadItems.value.push(uploadItem);

  if (window?.KnimePageLoader) {
    let reader = new FileReader();
    reader.onload = (res) => {
      const index = uploadItems.value.findIndex((i) => i.id === uploadItem.id);
      if (index !== -1) {
        uploadItems.value[index].status = UploadState.complete;
        uploadItems.value[index].progress = 100;
      }
      onUploadComplete(uploadItem, res.target!.result as string);
    };
    reader.readAsDataURL(file);
  }
};

const onChange = () => {
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
          :multiple="multiple"
          label-text="Choose files or drop here"
          :supported-formats="fileTypes"
          :layout="layout"
          :style="{ height: dropzoneHeight }"
          :disabled="disabled"
          @file-added="onFileAdded"
        >
          <ProgressList v-if="!empty" style="width: 100%">
            <UploadProgressPanelItem
              v-for="item in uploadItems"
              :key="item.id"
              :item="item"
              :allow-cancel="true"
              :allow-remove="true"
              @remove="onRemove(item)"
              @cancel="onCancel(item)"
            />
          </ProgressList>
        </Dropzone>
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
