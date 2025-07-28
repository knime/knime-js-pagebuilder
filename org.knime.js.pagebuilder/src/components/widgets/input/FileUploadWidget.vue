<script>
import { partial } from "filesize";

import { Button, Label } from "@knime/components";
import CircleCheckIcon from "@knime/styles/img/icons/circle-check.svg";

import { getFileExtension } from "../../../util/fileUtils";
import ErrorMessage from "../baseElements/text/ErrorMessage.vue";

const DATA_TYPE = "path";
/**
 * File Upload Widget
 */
export default {
  components: {
    Label,
    ErrorMessage,
    Button,
    CircleCheckIcon,
  },
  props: {
    nodeConfig: {
      required: true,
      type: Object,
      validator(obj) {
        return obj.nodeInfo && obj.viewRepresentation;
      },
    },
    nodeId: {
      required: true,
      type: String,
      validator(nodeId) {
        return Boolean(nodeId);
      },
    },
    /**
     * Controls the alignment of the upload button
     */
    alignment: {
      type: String,
      default: "horizontal",
      validator(val) {
        return ["horizontal", "vertical"].includes(val);
      },
    },
    isValid: {
      default: true,
      type: Boolean,
    },
    valuePair: {
      default: () => ({
        [DATA_TYPE]: "",
      }),
      type: Object,
    },
    errorMessage: {
      default: null,
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["updateWidget"],
  data() {
    return {
      uploadAPI: null,
      uploadProgress: 0,
      uploading: false,
      uploadErrorMessage: null,
      initialized: false,
      localFileName: null,
      localFileSize: null,
    };
  },
  computed: {
    viewRep() {
      return this.nodeConfig.viewRepresentation;
    },
    label() {
      return this.viewRep.label;
    },
    description() {
      return this.viewRep.description;
    },
    fileTypes() {
      return this.viewRep.fileTypes;
    },
    path() {
      return this.valuePair?.path;
    },
    fileName() {
      return (
        this.valuePair?.fileName || this.localFileName || "No file selected."
      );
    },
    fileSize() {
      if (!this.localFileSize) {
        return null;
      }
      let parsedSize = partial({
        output: "object",
      })(this.localFileSize);
      return parsedSize;
    },
    progressStyle() {
      return isNaN(this.uploadProgress)
        ? "width:0%;"
        : `width:${this.uploadProgress}%;`;
    },
  },
  mounted() {
    this.uploadAPI = this.$store.getters["api/uploadResource"];
  },
  methods: {
    async onChange(e) {
      if (!e.target) {
        return null;
      }
      let file = e.target.files[0];
      if (!file) {
        return null;
      }
      this.uploading = true;
      this.uploadErrorMessage = null;
      this.localFileName = file.name;
      this.localFileSize = file.size;
      if (window?.KnimePageLoader) {
        let reader = new FileReader();
        reader.onload = (res) => {
          this.setUploadProgress(100);
          this.$emit("updateWidget", {
            nodeId: this.nodeId,
            type: DATA_TYPE,
            update: {
              "viewRepresentation.currentValue.path": res.target.result,
              "viewRepresentation.currentValue.fileName": this.localFileName,
            },
          });
          this.uploading = false;
        };
        reader.readAsDataURL(file);
        return null;
      }
      let { response, errorResponse } = await this.uploadAPI({
        nodeId: this.nodeId,
        resource: file,
        progressCallback: this.setUploadProgress,
        context: this,
      });
      if (errorResponse) {
        this.uploading = false;
        this.uploadErrorMessage = errorResponse.cancelled
          ? "Upload cancelled."
          : "Upload failed.";
        this.localFileName = null;
        this.localFileSize = null;
        return null;
      }
      this.$emit("updateWidget", {
        nodeId: this.nodeId,
        type: DATA_TYPE,
        update: {
          "viewRepresentation.currentValue.path": response.location,
          "viewRepresentation.currentValue.fileName": this.localFileName,
        },
      });
      this.uploading = false;
      return null;
    },
    setUploadProgress(progress) {
      this.uploadProgress = progress;
    },
    validate() {
      let isValid = true;
      let errorMessage = null;
      if (!this.uploadAPI) {
        return { isValid };
      }
      if (this.fileTypes?.length && this.fileName) {
        isValid = this.fileTypes
          ?.map((type) => type?.toLowerCase())
          .includes(`.${getFileExtension(this.fileName)?.toLowerCase()}`);
        if (!isValid) {
          errorMessage =
            "The type of the selected file does not match the allowed file " +
            `types (${this.fileTypes.join(", ")}).`;
        }
      }
      if (!this.initialized) {
        // include default file type validation in initial response
        this.initialized = true;
        return { isValid, errorMessage };
      }
      if (this.uploading) {
        isValid = false;
        errorMessage = "Upload still in progress.";
      } else if (!this.path) {
        isValid = false;
        errorMessage = "Input is required.";
      }
      return {
        isValid,
        errorMessage: isValid ? null : errorMessage,
      };
    },
    triggerInput() {
      this.$refs.input.click();
    },
    abortUpload() {
      this.$store.getters["api/cancelUploadResource"]({ nodeId: this.nodeId });
    },
  },
};
</script>

<template>
  <div :class="alignment" :title="description">
    <Label :text="label" large>
      <div class="upload-wrapper">
        <Button
          v-if="!uploading"
          primary
          compact
          :disabled="disabled"
          @click="triggerInput"
        >
          Select file
        </Button>
        <Button v-else primary compact @click="abortUpload"> Cancel </Button>
        <p :class="{ disabled: disabled }">
          {{ fileName || "No file selected."
          }}<!--
          -->{{ fileSize ? ` (${fileSize.value} ${fileSize.symbol})` : "" }}
          <CircleCheckIcon v-if="uploadProgress === 100 && !uploading" />
        </p>
      </div>
      <input
        ref="input"
        type="file"
        :accept="fileTypes.join(',')"
        :disabled="disabled"
        @change="onChange"
      />
      <div :class="['progress-bar-wrapper', { 'show-bar': uploading }]">
        <div class="progress-bar" :style="progressStyle">
          <span> {{ uploadProgress }}% </span>
        </div>
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
  overflow-wrap: anywhere;

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
