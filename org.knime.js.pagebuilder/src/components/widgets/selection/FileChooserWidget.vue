<script>
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import TreeSelect from '../baseElements/selection/TreeSelect';

const DATA_TYPE = 'items';
/**
 * @typedef ItemsDataType
 * @type {object}
 * @property {string} path - file path.
 * @property {string} type - either 'DATA', 'WORKFLOW' or 'DIRECTORY'.
 */

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
                return obj.nodeInfo && obj.viewRepresentation && obj.viewRepresentation.tree;
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
            treeData: this.transformTree(this.nodeConfig.viewRepresentation.tree)
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
        value() {
            return this.valuePair[DATA_TYPE];
        },
        multipleSelection() {
            return this.viewRep.multipleSelection || false;
        },
        rawTree() {
            return this.viewRep.tree;
        }
    },
    watch: {
        rawTree(newValue) {
            this.treeData = this.transformTree(newValue);
        }
    },
    methods: {
        transformTree(tree) {
            return tree.map(item => this.transformTreeItem(item));
        },
        transformTreeItem(item) {
            const state = item.state || {};
            return {
                text: item.text,
                value: item.text,
                icon: item.children && item.children.length > 0 ? '' : 'file',
                opened: Boolean(state.opened),
                selected: Boolean(state.selected),
                disabled: Boolean(state.disabled),
                loading: false,
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
                    paths.push(item.userData);
                }
                if (item.children && item.children.length > 0) {
                    paths.concat(this.buildSelectedPaths(item.children, paths));
                }
            }
            return paths;
        },
        onInput(node, item, e) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE,
                /** @type ItemsDataType[] */
                value: JSON.parse(JSON.stringify(this.buildSelectedPaths(this.treeData)))
            };
            console.log('onInput', JSON.parse(JSON.stringify(changeEventObj)));
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            let isValid = true;
            let errorMessage;
            if (this.viewRep.required && !this.buildSelectedPaths(this.treeData).length > 0) {
                isValid = false;
                errorMessage = 'Selection is required.';
            }
            if (typeof this.$refs.form.validate === 'function') {
                let validateEvent = this.$refs.form.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage || errorMessage || 'Current selection is invalid.';
            }
            return {
                isValid,
                errorMessage: isValid ? null : errorMessage
            };
        }
    }
};
</script>

<template>
  <Label :text="label">
    <template #default="{ labelForId }">
      <TreeSelect
        :id="labelForId"
        ref="form"
        class="tree"
        :aria-label="label"
        :data="treeData"
        :multiple="multipleSelection"
        :is-valid="isValid"
        :allow-transition="true"
        :title="description"
        @item-click="onInput"
      />
      <ErrorMessage :error="errorMessage" />
    </template>
  </Label>
</template>
