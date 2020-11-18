<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import Button from '~/webapps-common/ui/components/Button';
import getFileExtension from '~/src/util/getFileExtension';
import CircleCheckIcon from '~/webapps-common/ui/assets/img/icons/circle-check.svg?inline';

const DATA_TYPE = 'path';
/**
 * File Upload Widget
 */
export default {
    components: {
        Label,
        ErrorMessage,
        Button,
        CircleCheckIcon
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo && obj.viewRepresentation;
            }
        },
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return Boolean(nodeId);
            }
        },
        /**
         * Controls the alignment of the upload button
         */
        alignment: {
            type: String,
            default: 'horizontal',
            validator(val) {
                return ['horizontal', 'vertical'].includes(val);
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                [DATA_TYPE]: ''
            }),
            type: Object
        },
        errorMessage: {
            default: null,
            type: String
        }
    },
    data() {
        return {
            uploadProgress: 0,
            selectedFile: null,
            showBar: false
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
        disabled() {
            return false; // option not needed right now, for later use
        },
        value() {
            return this.valuePair[DATA_TYPE];
        },
        progressStyle() {
            return isNaN(this.uploadProgress) ? `width:0%;` : `width:${this.uploadProgress}%;`;
        }
    },
    methods: {
        async onChange(e) {
            let uploadResource = this.$store.getters['api/uploadResource'];
            if (!uploadResource) {
                return null;
            }
            let file = e.target.files[0];
            if (!file) {
                return null;
            }
            this.showBar = true;
            this.selectedFile = file.name;
            let responseObject = await uploadResource({
                nodeId: this.nodeId,
                resource: file,
                progressCallback: this.setUploadProgress
            });
            return this.$emit('updateWidget', {
                nodeId: this.nodeId,
                type: DATA_TYPE,
                value: responseObject.response.location
            });
        },
        setUploadProgress(progress) {
            this.uploadProgress = progress;
            if (progress === 100) {
                this.showBar = false;
            }
        },
        validate() {
            let isValid = true;
            let errorMessage = null;

            if (this.fileTypes.length && this.value) {
                isValid = this.fileTypes.includes(getFileExtension(this.value));
                errorMessage =
                `The type of the selected file does not match the allowed file types (${this.fileTypes.join(', ')})`;
            }

            return {
                isValid,
                errorMessage: isValid ? null : errorMessage
            };
        },
        triggerInput() {
            this.$refs.input.click();
        }
    }
};
</script>

<template>
  <div
    :class="alignment"
    :title="description"
  >
    <Label
      :text="label"
    >
      <div class="upload-wrapper">
        <Button
          primary
          compact
          :disabled="disabled"
          @click="triggerInput"
        >
          Select file
        </Button>
        <p :class="{'disabled': disabled}">{{ selectedFile || 'No selected file' }}
          <CircleCheckIcon v-if="uploadProgress === 100" />
        </p>
      </div>
      <input
        ref="input"
        type="file"
        :accept="fileTypes.join(',')"
        @input="onChange"
      >
      <div
        :class="['progress-bar-wrapper', {'show-bar': showBar}]"
      >
        <div
          class="progress-bar"
          :style="progressStyle"
        />
      </div>
    </Label>
    <ErrorMessage :error="errorMessage" />
  </div>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

p {
  font-size: 13px;
  line-height: 18px;
  margin: 0;
  margin-top: 10px;
  display: flex;
  align-items: center;

  &.disabled {
    opacity: 0.5;
  }

  & svg {
    width: 16px;
    height: 16px;
    stroke-width: calc(32px / 16);
    stroke: var(--theme-color-success);
    margin-left: 5px;
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
  background-color: var(--knime-gray-ultra-light);
  position: relative;
  transition: opacity linear 0.3s 0.3s;

  &.show-bar {
    opacity: 100%;
  }

  &::after {
    content: '';
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
