<script>
import mime from 'mime-types';
import getFileExtension from '~/src/util/getFileExtension';
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import FileLink from 'webapps-common/ui/components/FileLink';

/**
 * File Download Widget
 */
export default {
    components: {
        Label,
        FileLink,
        ErrorMessage
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
        isValid: {
            default: true,
            type: Boolean
        },
        errorMessage: {
            default: null,
            type: String
        }
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
        linkTitle() {
            return this.viewRep.linkTitle;
        },
        fileType() {
            return mime.lookup(this.viewRep.path) || 'application/octet-stream';
        },
        fileExt() {
            return getFileExtension(this.viewRep.path);
        },
        link() {
            let getDownloadLinkFunc = this.$store.getters['api/downloadResourceLink'];
            if (!getDownloadLinkFunc) {
                return null;
            }
            return getDownloadLinkFunc({
                resourceId: this.viewRep.path,
                nodeId: this.nodeId
            });
        },
        size() {
            /* The API does not provide this information. */
            return 0;
        }
    },
    methods: {
        validate() {
            let isValid = this.link !== null;
            return {
                isValid,
                errorMessage: isValid ? null : 'File download only available on server.'
            };
        }
    }
};
</script>

<template>
  <div :title="description">
    <Label
      :text="label"
    />
    <FileLink
      v-if="link != null"
      :href="link"
      :text="linkTitle"
      :file-ext="fileExt"
      :mime-type="fileType"
      :size="size"
    />
    <ErrorMessage :error="errorMessage" />
  </div>
</template>
