<script>
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import MultiselectListBox from 'webapps-common/ui/components/forms/MultiselectListBox';
import Twinlist from 'webapps-common/ui/components/forms/Twinlist';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import Checkboxes from 'webapps-common/ui/components/forms/Checkboxes';

const DATA_TYPE = 'value';

/**
 * Multiple Selection Widget
 * Allows the user to select multiple items from a list of possible choices.
 * The view representation can either be a Twinlist, Checkboxes or a ListBox
 */
export default {
    components: {
        Checkboxes,
        Fieldset,
        MultiselectListBox,
        Twinlist,
        Label,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
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
        valuePair: {
            default: () => ({
                [DATA_TYPE]: []
            }),
            type: Object
        }
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        possibleChoices() {
            return this.viewRep.possibleChoices.map((x) => ({
                id: x,
                text: x
            }));
        },
        description() {
            return this.viewRep.description || null;
        },
        maxVisibleListEntries() {
            if (this.viewRep.limitNumberVisOptions) {
                return this.viewRep.numberVisOptions;
            }
            // eslint-disable-next-line no-magic-numbers
            return 0; // default: show all
        },
        errorMessage() {
            if (this.isValid) {
                return null;
            }
            if (this.viewRep.errorMessage) {
                return this.viewRep.errorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeErrorMessage) {
                return this.nodeConfig.nodeInfo.nodeErrorMessage;
            }
            if (this.nodeConfig.nodeInfo.nodeWarnMessage) {
                return this.nodeConfig.nodeInfo.nodeWarnMessage;
            }
            return 'Current selected item is invalid';
        },
        value() {
            return this.valuePair[DATA_TYPE];
        },
        isList() {
            return this.viewRep.type === 'List';
        },
        isTwinlist() {
            return this.viewRep.type === 'Twinlist';
        },
        isCheckboxes() {
            return this.viewRep.type === 'Check boxes (horizontal)' ||
                this.viewRep.type === 'Check boxes (vertical)';
        },
        checkBoxesAlignment() {
            if (this.viewRep.type === 'Check boxes (vertical)') {
                return 'vertical';
            } else if (this.viewRep.type === 'Check boxes (horizontal)') {
                return 'horizontal';
            }
            return null;
        }
    },
    methods: {
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE,
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            let isValid = true;
            if (this.viewRep.required) {
                isValid = this.$refs.form.hasSelection();
            }
            return isValid;
        }
    }
};
</script>

<template>
  <div class="multi-select-widget">
    <Fieldset
      v-if="isCheckboxes || isTwinlist"
      :text="label"
      class="fieldset"
    >
      <Checkboxes
        v-if="isCheckboxes"
        ref="form"
        :value="value"
        :alignment="checkBoxesAlignment"
        :aria-label="label"
        :possible-values="possibleChoices"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <Twinlist
        v-if="isTwinlist"
        ref="form"
        :value="value"
        :size="maxVisibleListEntries"
        label-left="Excludes"
        label-right="Includes"
        :possible-values="possibleChoices"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Fieldset>
    <Label
      v-else
      :text="label"
    >
      <MultiselectListBox
        v-if="isList"
        ref="form"
        :value="value"
        :size="maxVisibleListEntries"
        :aria-label="label"
        :possible-values="possibleChoices"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Label>
  </div>
</template>

<style lang="postcss" scoped>
.multi-select-widget {
  /* required for text ellipsis on checkboxes */
  & .fieldset {
    min-width: auto;
    overflow-x: hidden;
  }
}
</style>
