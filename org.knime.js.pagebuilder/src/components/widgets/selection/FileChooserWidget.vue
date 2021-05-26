<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import TreeSelect from '../baseElements/selection/TreeSelect';

import fileIcon from '~/webapps-common/ui/assets/img/icons/file-text.svg?inline';
import cogIcon from '~/webapps-common/ui/assets/img/icons/cog.svg?inline';
import workflowIcon from '~/webapps-common/ui/assets/img/icons/workflow.svg?inline';
import folderIcon from '~/webapps-common/ui/assets/img/icons/folder.svg?inline';

import csvIcon from '~/webapps-common/ui/assets/img/icons/file-csv.svg?inline';
import docxIcon from '~/webapps-common/ui/assets/img/icons/file-docx.svg?inline';
import htmlIcon from '~/webapps-common/ui/assets/img/icons/file-html.svg?inline';
import mdIcon from '~/webapps-common/ui/assets/img/icons/file-md.svg?inline';
import odpIcon from '~/webapps-common/ui/assets/img/icons/file-odp.svg?inline';
import odsIcon from '~/webapps-common/ui/assets/img/icons/file-ods.svg?inline';
import odtIcon from '~/webapps-common/ui/assets/img/icons/file-odt.svg?inline';
import pdfIcon from '~/webapps-common/ui/assets/img/icons/file-pdf.svg?inline';
import pptxIcon from '~/webapps-common/ui/assets/img/icons/file-pptx.svg?inline';
import psIcon from '~/webapps-common/ui/assets/img/icons/file-ps.svg?inline';
import xlsIcon from '~/webapps-common/ui/assets/img/icons/file-xls.svg?inline';
import xlsxIcon from '~/webapps-common/ui/assets/img/icons/file-xlsx.svg?inline';
import xmlIcon from '~/webapps-common/ui/assets/img/icons/file-xml.svg?inline';
import zipIcon from '~/webapps-common/ui/assets/img/icons/file-zip.svg?inline';
import exeIcon from '~/webapps-common/ui/assets/img/icons/file-zip-exe.svg?inline';

const DATA_TYPE = 'items';
const SCHEME = 'knime';
const SCHEME_PART = `${SCHEME}://`;
const WORKFLOW_RELATIVE = 'knime.workflow';
const MOUNTPOINT_RELATIVE = 'knime.mountpoint';
const SERVER_ITEM_TYPE = {
    WORKFLOW: 'Workflow',
    WORKFLOW_GROUP: 'WorkflowGroup',
    DATA: 'Data'
};
const WIDGET_ITEM_TYPE = {
    WORKFLOW: 'WORKFLOW',
    DIR: 'DIRECTORY',
    DATA: 'DATA',
    UNKNOWN: 'UNKNOWN'
};

/**
 * File Chooser Widget
 */
export default {
    components: {
        TreeSelect,
        Label,
        ErrorMessage,
        /* eslint-disable vue/no-unused-components */
        csvIcon,
        docxIcon,
        htmlIcon,
        mdIcon,
        odpIcon,
        odsIcon,
        odtIcon,
        pdfIcon,
        pptxIcon,
        psIcon,
        xlsIcon,
        xlsxIcon,
        xmlIcon,
        zipIcon,
        exeIcon
        /* eslint-enable vue/no-unused-components */
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
            if (this.viewRep.runningOnServer !== true && !this.runningInNewWebPortal) {
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
        defaultPahts() {
            let defaultPaths = [];
            let pathArray = this.viewRep.currentValue.items;
            pathArray.forEach((defaultPath) => {
                let pathWithoutScheme = defaultPath.path.replace(SCHEME_PART, '');
                let path = pathWithoutScheme.substring(pathWithoutScheme.indexOf('/'));
                if (path.length > 0 && path.substring(path.length - 1) === '/') {
                    path = path.substring(0, path.length - 1);
                }
                defaultPaths.push(decodeURIComponent(path));
            });
            return defaultPaths;
        },
        rootPath() {
            let rootPath = decodeURIComponent(this.viewRep.rootDir || '/');
            // resolve workflow and mountpoint relative root paths
            if (rootPath.toLowerCase().startsWith(SCHEME_PART)) {
                let pathWithoutScheme = rootPath.replace(SCHEME_PART, '');
                let schemeIndex = pathWithoutScheme.indexOf('/') + 1;
                rootPath = pathWithoutScheme.substring(schemeIndex - 1);
                let host = pathWithoutScheme.substring(0, schemeIndex - 1);

                if (host === WORKFLOW_RELATIVE) {
                    rootPath = this.resolveWorkflowRelativePath(rootPath);
                } else if (host === MOUNTPOINT_RELATIVE || !host.startsWith(SCHEME)) {
                    rootPath = this.normalizePath(rootPath);
                }
            }
            return rootPath;
        },
        // Checks if the current execution environment is the new WebPortal.
        runningInNewWebPortal() {
            return !this.viewRep.runningOnServer &&
                (!window.KnimePageLoader || window.KnimePageLoader?.isRunningInWebportal());
        },
        // Determines if the widget should be shown. This is the case if its running in the new WebPortal and the data is ready,
        // or if it's running in the old WebPortal
        showWidget() {
            return Boolean((this.runningInNewWebPortal && this.dataReady) || !this.runningInNewWebPortal);
        }
    },
    watch: {
        rawTree(newValue) {
            this.treeData = this.transformTree(newValue);
        }
    },
    mounted() {
        // Creates the tree if it is running on the new WebPortal
        if (this.runningInNewWebPortal) {
            const rootPath = this.rootPath;
            const defaultPaths = this.defaultPahts;
            let request = this.$store.getters['api/repository']({ path: rootPath, filter: null });
            if (request) {
                request.then((repo) => {
                    this.setRepository(repo.response, defaultPaths);
                    this.dataReady = true;
                    this.onChange();
                });
            }
        } else {
            // Call update widget to update the currentValue object with the correct paths (prefix etc.)
            this.onChange();
        }
    },
    methods: {
        resolveWorkflowRelativePath(path) {
            let relativePath = path;
            let workflowPath = parent.KnimePageBuilderAPI.getWorkflow();
            if (workflowPath) {
                if (workflowPath.endsWith('/')) {
                    workflowPath = workflowPath.substring(0, workflowPath.length - 1);
                }
                relativePath = this.normalizePath(workflowPath + path);
            }
            return relativePath;
        },
        normalizePath(path) {
            let normalizedPath = this.normalizeArray(path.split('/'), true).join('/');
            if (!normalizedPath.startsWith('/')) {
                normalizedPath = `/${normalizedPath}`;
            }
            return normalizedPath;
        },
        checkMountId() {
            // determine path prefix from mountId
            let mountId = this.viewRep.customMountId;
            if (this.viewRep.useDefaultMountId) {
                mountId = this.$store.state.settings.defaultMountId;
            }
            if (mountId) {
                this.changePrefix(SCHEME_PART + mountId);
            }
        },
        changePrefix(prefix) {
            this.prefix = prefix;
        },
        normalizeArray(parts, allowAboveRoot) {
            let res = [];
            for (let i = 0; i < parts.length; i++) {
                let p = parts[i];

                // ignore empty parts
                if (!p || p === '.') {
                    continue;
                }
                if (p === '..') {
                    if (res.length && res[res.length - 1] !== '..') {
                        res.pop();
                    } else if (allowAboveRoot) {
                        res.push('..');
                    }
                } else {
                    res.push(p);
                }
            }
            return res;
        },
        setRepository(repository, defaultPaths) {
            if (repository && repository.children && repository.children.length > 0) {
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
            if (!repositoryItem || !repositoryItem.path) {
                return null;
            }
            let treeItem = {
                id: repositoryItem.path,
                text: this.getNameFromPath(repositoryItem.path),
                state: {
                    opened: false,
                    disabled: false,
                    selected: false
                },
                children: []
            };
            
            // set type and icons
            let baseUrl = `${this.$store.state.pagebuilder.resourceBaseUrl
            }/org/knime/js/base/node/widget/input/filechooser/img/`;
            if (repositoryItem.type === SERVER_ITEM_TYPE.WORKFLOW) {
                if (!this.viewRep.selectWorkflows) {
                    return null;
                }
                treeItem.type = WIDGET_ITEM_TYPE.WORKFLOW;
                treeItem.icon = `${baseUrl}workflow.png`;
            } else if (repositoryItem.type === SERVER_ITEM_TYPE.WORKFLOW_GROUP) {
                treeItem.type = WIDGET_ITEM_TYPE.DIR;
                treeItem.icon = `${baseUrl}workflowgroup.png`;
                if (!this.viewRep.selectDirectories) {
                    treeItem.state.disabled = true;
                }
            } else if (repositoryItem.type === SERVER_ITEM_TYPE.DATA) {
                if (!this.viewRep.selectDataFiles) {
                    return null;
                }
                let endIndex = treeItem.text.lastIndexOf('.');
                let fileEnding = treeItem.text;
                if (endIndex > 0 && endIndex < treeItem.text.length - 1) {
                    fileEnding = treeItem.text.substring(endIndex);
                }
                // check if file type is allowed
                if (this.viewRep.fileTypes && this.viewRep.fileTypes.length > 0) {
                    let allowedFileEnding = this.viewRep.fileTypes.some(
                        (fileType) => fileType.toLowerCase() === fileEnding.toLowerCase()
                    );
                    if (!allowedFileEnding) {
                        return null;
                    }
                }
                
                treeItem.type = WIDGET_ITEM_TYPE.DATA;

                // set custom icon if possible
                treeItem.icon = this.getIcon(fileEnding);
            }
            
            // set selection if default paths match
            if (defaultPaths && defaultPaths.length > 0) {
                defaultPaths.forEach((defaultPath) => {
                    if (defaultPath && defaultPath.startsWith(treeItem.id)) {
                        treeItem.state.opened = true;
                        if (defaultPath === treeItem.id) {
                            treeItem.state.opened = false;
                            treeItem.state.selected = true;
                        }
                    }
                });
            }
            
            // resolve children
            if (treeItem.type === WIDGET_ITEM_TYPE.DIR) {
                if (repositoryItem.children) {
                    repositoryItem.children.forEach((child) => {
                        let childItem = this.createTreeItemRecursively(child, defaultPaths);
                        if (childItem) {
                            treeItem.children.push(childItem);
                        }
                    });
                }
                
                // remove empty directories if directories can't be selected
                if (treeItem.children.length < 1 && !this.viewRep.selectDirectories) {
                    return null;
                }
            }
            
            return treeItem;
        },
        getIcon(fileEnding) {
            let icon = fileIcon;
            if (fileEnding) {
                switch (fileEnding) {
                case '.csv':
                    icon = csvIcon;
                    break;
                case '.xls':
                    icon = xlsIcon;
                    break;
                case '.xlsx':
                    icon = xlsxIcon;
                    break;
                case '.xml':
                    icon = xmlIcon;
                    break;
                case '.docx':
                    icon = docxIcon;
                    break;
                case '.html':
                    icon = htmlIcon;
                    break;
                case 'mdIcon':
                    icon = mdIcon;
                    break;
                case 'odpIcon':
                    icon = odpIcon;
                    break;
                case 'odsIcon':
                    icon = odsIcon;
                    break;
                case 'odtIcon':
                    icon = odtIcon;
                    break;
                case 'pdfIcon':
                    icon = pdfIcon;
                    break;
                case 'pptx':
                    icon = pptxIcon;
                    break;
                case 'ps':
                    icon = psIcon;
                    break;
                case 'zipIcon':
                    icon = zipIcon;
                    break;
                default:
                    icon = fileIcon;
                    break;
                }
            }
            return icon;
        },
        getNameFromPath(path) {
            let index = path.lastIndexOf('/');
            if (index + 1 >= path.length) {
                index = -1;
            }
            return index < 0 ? path : path.substring(index + 1);
        },
        iconForItem(item) {
            switch (item.type) {
            case 'WORKFLOW':
                return workflowIcon;
            case 'DIRECTORY':
                return folderIcon;
            default:
                return item.icon;
            }
        },
        transformTree(tree) {
            return tree ? tree.map(item => this.transformTreeItem(item)) : [];
        },
        transformTreeItem(item) {
            const state = item.state || {};
            return {
                text: item.text,
                value: item.text,
                opened: Boolean(state.opened),
                selected: Boolean(state.selected),
                disabled: Boolean(state.disabled),
                icon: this.iconForItem(item),
                selectedIcon: item.children ? '' : cogIcon,
                userData: {
                    path: item.id,
                    type: item.type
                },
                children: item.children ? item.children.map(child => this.transformTreeItem(child)) : []
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
                if (item.children && item.children.length > 0) {
                    paths.concat(this.buildSelectedPaths(item.children, paths));
                }
            }
            return paths;
        },
        onChange() {
            if (this.runningInNewWebPortal) {
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
