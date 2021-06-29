<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import TreeSelect from '../baseElements/selection/TreeSelect';

import fileIcon from '~/webapps-common/ui/assets/img/icons/file-text.svg?inline';
import cogIcon from '~/webapps-common/ui/assets/img/icons/cog.svg?inline';
import workflowIcon from '~/webapps-common/ui/assets/img/icons/workflow.svg?inline';
import folderIcon from '~/webapps-common/ui/assets/img/icons/folder.svg?inline';

import { trimSchema as utilTrimSchema, getRootPath as utilGetRootPath } from '~/src/util/fileUtils';
import { default as utilCreateTreeItem } from '~/src/util/createTreeItem';

const DATA_TYPE = 'items';
const SCHEMA = 'knime';
const SCHEMA_PART = `${SCHEMA}://`;

/**
 * File Chooser Widget
 */
export default {
    components: {
        TreeSelect,
        Label,
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
                return nodeId !== '';
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                [DATA_TYPE]: []
            }),
            type: Object
        },
        errorMessage: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            repositoryAPI: null,
            treeData: this.transformTree(this.nodeConfig.viewRepresentation.tree),
            dataReady: false,
            prefix: ''
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
            return this.viewRep.description || null;
        },
        infoMessage() {
            if (!this.viewRep.runningOnServer && !this.runningInWebPortal) {
                return 'File selection only possible on server.';
            } else if (this.treeData.length === 0) {
                return 'No items found for selection.';
            }
            return null;
        },
        multipleSelection() {
            return this.viewRep.multipleSelection || false;
        },
        rawTree() {
            return this.viewRep.tree;
        },
        // returns an array of paths, where the schema part and the mountpoint is split and no trailing '/' is present
        defaultPaths() {
            return this.viewRep.currentValue.items?.reduce((prevValue, currentValue) => {
                let trimmedPath = utilTrimSchema(currentValue.path, SCHEMA_PART);
                prevValue.push(decodeURIComponent(trimmedPath));
                return prevValue;
            }, []);
        },
        rootPath() {
            let rootDir = decodeURIComponent(this.viewRep.rootDir || '/');
            let workflowPath = this.$store.getters['wizardExecution/workflowPath'];
            let rootPath = utilGetRootPath(rootDir, SCHEMA_PART, SCHEMA, workflowPath);

            return rootPath || rootDir;
        },
        // Checks if the current execution environment is the new WebPortal.
        runningInWebPortal() {
            return !window.KnimePageLoader || window.KnimePageLoader?.isRunningInWebportal();
        },
        // Determines if the widget should be shown. This is the case if its running in the WebPortal and the data is ready,
        // or if it's running in the AP.
        showWidget() {
            return !this.runningInWebPortal || this.dataReady;
        }
    },
    watch: {
        rawTree(newValue) {
            this.treeData = this.transformTree(newValue);
        }
    },
    mounted() {
        // Creates the tree if it is running on the new WebPortal
        if (this.runningInWebPortal) {
            this.repositoryAPI = this.$store.getters['api/repository'];
            this.requestRepository(this.rootPath);
        }
    },
    methods: {
        async requestRepository(rootPath) {
            let { response, errorResponse } = await this.repositoryAPI({
                path: rootPath,
                filter: null
            });
            const defaultPaths = this.defaultPaths;
            this.dataReady = true;
            if (errorResponse) {
                return null;
            }
            if (response) {
                this.setRepository(response, defaultPaths);
                this.onChange();
            }
            return null;
        },
        setRepository(repository, defaultPaths) {
            if (repository?.children?.length) {
                let tree = [];
                repository.children.forEach((child) => {
                    let childItem = this.createTreeItemRecursively(child, defaultPaths);
                    if (childItem) {
                        tree.push(childItem);
                    }
                });
                if (tree.length > 0) {
                    this.treeData = this.transformTree(tree);
                }
            }
        },
        createTreeItemRecursively(repositoryItem, defaultPaths) {
            if (!repositoryItem?.path) {
                return null;
            }
            return utilCreateTreeItem(repositoryItem, defaultPaths, this.viewRep);
        },
        iconForItem(item) {
            switch (item.type) {
            case 'WORKFLOW':
                return workflowIcon;
            case 'DIRECTORY':
                return folderIcon;
            default:
                return fileIcon;
            }
        },
        transformTree(tree) {
            return tree?.map(item => this.transformTreeItem(item)) || [];
        },
        transformTreeItem(item) {
            const state = item.state || {};
            return {
                text: item.text,
                value: item.text,
                opened: Boolean(state.opened),
                selected: Boolean(state.selected),
                disabled: Boolean(state.disabled),
                icon: item.icon || this.iconForItem(item),
                selectedIcon: item.children ? '' : cogIcon,
                userData: {
                    path: item.id,
                    type: item.type
                },
                children: item.children?.map(child => this.transformTreeItem(child)) || []
            };
        },
        /**
         * Generate a items value from the treeData.
         * @param {Array} subtree - call with tree data.
         * @param {Array} [paths=[]] - communicate paths to recurring call.
         * @returns {ItemsDataType[]} array with `path` and `type` objects.
         */
        buildSelectedPaths(subtree, paths) {
            paths = paths || [];
            for (const item of subtree) {
                if (item.selected) {
                    paths.push({
                        path: `${this.nodeConfig.viewRepresentation.prefix ||
                        this.prefix ||
                        ''
                        }${encodeURI(item.userData.path)}`,
                        type: item.userData.type
                    });
                }
                if (item.children?.length) {
                    paths.concat(this.buildSelectedPaths(item.children, paths));
                }
            }
            return paths;
        },
        onChange() {
            if (this.runningInWebPortal) {
                this.checkMountId();
            }
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE,
                /** @type ItemsDataType[] */
                value: JSON.parse(JSON.stringify(this.buildSelectedPaths(this.treeData)))
            };
            this.$emit('updateWidget', changeEventObj);
        },
        checkMountId() {
            // determine path prefix from mountId
            let mountId = this.viewRep.customMountId;
            if (this.viewRep.useDefaultMountId) {
                mountId = this.$store.state.settings.defaultMountId;
            }
            if (mountId) {
                this.prefix = SCHEMA_PART + mountId;
            }
        },
        validate() {
            if (this.infoMessage) {
                return {
                    isValid: true,
                    errorMessage: ''
                };
            }
            let isValid = true;
            let errorMessage;
            if (this.viewRep.required && this.buildSelectedPaths(this.treeData).length === 0) {
                isValid = false;
                errorMessage = 'Selection is required.';
            }
            return {
                isValid,
                errorMessage: isValid ? null : errorMessage
            };
        }
    }
};
/**
 * @typedef ItemsDataType
 * @type {object}
 * @property {string} path - file path.
 * @property {string} type - either 'DATA', 'WORKFLOW' or 'DIRECTORY'.
 */
</script>

<template>
  <Label
    v-if="showWidget"
    :text="label"
  >
    <template #default="{ labelForId }">
      <div
        v-if="infoMessage"
        class="info"
      >
        {{ infoMessage }}
      </div>
      <TreeSelect
        v-else
        :id="labelForId"
        ref="form"
        :aria-label="label"
        :data="treeData"
        :multiple="multipleSelection"
        :is-valid="isValid"
        :allow-transition="true"
        :title="description"
        @item-click="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </template>
  </Label>
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

.info {
  padding: 0.7em;
  background: var(--knime-white);
  border: 1px solid var(--knime-stone-gray);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--knime-masala);
  }
}

</style>
