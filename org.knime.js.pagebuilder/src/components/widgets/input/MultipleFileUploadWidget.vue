<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { v4 as uuid } from "uuid";
import { useStore } from "vuex";

import {
  Dropzone,
  Label,
  ProgressList,
  UploadItem,
  UploadItemStatus,
  UploadProgressPanelItem,
} from "@knime/components";

import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

declare global {
  interface Window {
    KnimePageLoader?: any;
  }
}
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

interface AbortableUploadItem extends UploadItem {
  abortController?: AbortController;
}

const UploadState: Partial<{ [key in UploadItemStatus]: UploadItemStatus }> = {
  inprogress: "inprogress",
  cancelled: "cancelled",
  failed: "failed",
  complete: "complete",
  processing: "processing",
} as const;

interface Props {
  nodeConfig: {
    nodeInfo: any;
    viewRepresentation: any;
  };
  nodeId: string;
  isValid?: boolean;
  valuePair?: {
    files?: FileValue[];
    [key: string]: any;
  };
  errorMessage?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  isValid: true,
  valuePair: () => ({ files: [] }),
  errorMessage: null,
});

const uploadItems = ref<AbortableUploadItem[]>([]);

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
const multiple = computed(() => viewRep.value.multiple as boolean);
const fileTypes = computed(() => viewRep.value.fileTypes as string[]);
const required = computed(() => viewRep.value.required as boolean);
const disabled = computed(() => viewRep.value.disabled as boolean);
const files = computed(() => (props.valuePair?.files ?? []) as FileValue[]);
for (const file of files.value) {
  uploadItems.value.push({
    id: file.id,
    name: file.fileName,
    size: file.fileSize,
  });
}
const empty = computed(() => uploadItems.value.length === 0);

const dropzoneHeight = computed(() => {
  return multiple.value ? "320px" : "94px"; // fixed value for 4 or 1 items high
});

const layout = computed(() => {
  return multiple.value ? "vertical" : "horizontal";
});

const validate = () => {
  let isValid = true;
  let errorMessage = null;

  /* if (!uploadAPI.value) {
    return { isValid };
  } */

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
  const newFileValue: FileValue[] = [];
  if (multiple.value) {
    newFileValue.push(...files.value);
    const fileIndex = newFileValue.findIndex((i) => i.id === item.id);
    if (fileIndex !== -1) {
      newFileValue.splice(index, 1);
    }
  }
  emit("updateWidget", {
    nodeId: props.nodeId,
    type: DATA_TYPE,
    update: {
      "viewRepresentation.currentValue.files": newFileValue,
    },
  });
};

const onCancel = (item: UploadItem) => {
  const index = uploadItems.value.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    const item = uploadItems.value[index];
    item.status = UploadState.cancelled;
    delete item.progress;
    item.abortController?.abort();
  }
};

const uploadLocal = (file: File, uploadItem: AbortableUploadItem) => {
  let reader = new FileReader();
  reader.onload = (res) => {
    const index = uploadItems.value.findIndex((i) => i.id === uploadItem.id);
    if (index !== -1 && res.target) {
      uploadItems.value[index].status = UploadState.complete;
      uploadItems.value[index].progress = 100;
      onUploadComplete(uploadItem, res.target.result as string);
      delete uploadItems.value[index].progress;
    }
  };
  reader.onprogress = (event) => {
    const index = uploadItems.value.findIndex((i) => i.id === uploadItem.id);
    if (index !== -1 && event.lengthComputable) {
      uploadItems.value[index].progress = (event.loaded / event.total) * 100;
    }
  };
  reader.onerror = (event) => {
    const index = uploadItems.value.findIndex((i) => i.id === uploadItem.id);
    if (index !== -1) {
      uploadItems.value[index].abortController?.abort();
      uploadItems.value[index].status = UploadState.failed;
      delete uploadItems.value[index].progress;
      consola.error("File upload failed", event);
    }
  };
  uploadItem.abortController = reader as unknown as AbortController;
  reader.readAsDataURL(file);
};

const uploadRemote = (file: File, uploadItem: AbortableUploadItem) => {
  uploadItem.abortController = new AbortController();
  uploadAPI
    .value({
      nodeId: props.nodeId,
      resource: file,
      abortController: uploadItem.abortController,
      progressCallback: (progress: number) => {
        const index = uploadItems.value.findIndex(
          (i) => i.id === uploadItem.id,
        );
        if (index !== -1) {
          uploadItems.value[index].progress = progress;
        }
      },
    })
    .then(
      ({
        response,
        errorResponse,
      }: {
        response?: { location: string };
        errorResponse?: {};
      }) => {
        const index = uploadItems.value.findIndex(
          (i) => i.id === uploadItem.id,
        );
        if (index !== -1) {
          const item = uploadItems.value[index];
          if (errorResponse) {
            if (item.status === UploadState.cancelled) {
              return; // expected to fail if cancelled
            }
            item.status = UploadState.failed;
            item.progress = 0;
            consola.error("File upload failed", errorResponse);
          } else if (response) {
            item.status = UploadState.complete;
            item.progress = 100;
            onUploadComplete(uploadItem, response!.location);
            delete item.progress;
          }
        }
      },
    );
};

const onFilesSelected = (files: File[]) => {
  for (const file of files) {
    const uploadItem: AbortableUploadItem = {
      id: uuid(),
      name: file.name,
      size: file.size,
      progress: 0,
      status: UploadState.inprogress,
    };
    if (multiple.value) {
      uploadItems.value.unshift(uploadItem);
    } else {
      uploadItems.value = [uploadItem];
    }

    if (window?.KnimePageLoader) {
      uploadLocal(file, uploadItem);
    } else {
      uploadRemote(file, uploadItem);
    }
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
  <div>
    <Label :text="label" large>
      <div class="upload-wrapper">
        <Dropzone
          :multiple="multiple"
          label-text="Choose files or drop here"
          :accept="fileTypes"
          :layout="layout"
          :style="{ height: dropzoneHeight }"
          :empty="empty"
          :disabled="disabled"
          :error="!isValid"
          @files-selected="onFilesSelected"
        >
          <ProgressList
            v-if="!empty"
            class="upload-item-list"
            style="width: 100%"
          >
            <UploadProgressPanelItem
              v-for="item in uploadItems"
              :key="item.id"
              :item="item"
              allow-cancel
              allow-remove
              allow-delete
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
.upload-wrapper {
  & .upload-item-list {
    max-height: calc(4 * 60px); /* 4 items height */
    overflow-y: auto;
  }
}
</style>
