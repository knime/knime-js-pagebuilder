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
        infoMessage() {
            if (this.viewRep.runningOnServer === false) {
                return 'No items found for selection. View selection only possible on server.';
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
        }
    },
    watch: {
        rawTree(newValue) {
            this.treeData = this.transformTree(newValue);
        }
    },
    mounted() {
        // Call update widget to update the currentValue object with the correct paths (prefix etc.)
        this.onInput();
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
                    paths.push({
                        path: `${this.nodeConfig.viewRepresentation.prefix || ''}${item.userData.path}`,
                        type: item.userData.type
                    });
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
      <div v-if="infoMessage" class="info">
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
        @item-click="onInput"
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
