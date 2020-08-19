<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import FileLink from 'webapps-common/ui/components/FileLink';

import mime from 'mime-types';

const getExtension = (path) => {
    // extract file name from full path (supports `\\` and `/` separators)
    let basename = path.split(/[\\/]/).pop();
    let pos = basename.lastIndexOf('.');

    if (basename === '' || pos < 1) {
        return '';
    }

    // extract extension ignoring `.`
    return basename.slice(pos + 1);
};

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
            return getExtension(this.viewRep.path);
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
            return -1; // unknown for now
        }
    },
    methods: {
        validate() {
            if (this.link === null) {
                return {
                    isValid: false,
                    errorMessage: 'File download only available on server.'
                };
            }
            return {
                isValid: true,
                errorMessage: null
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
