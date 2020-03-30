<script>
import RadioButtons from 'webapps-common/ui/components/forms/RadioButtons';
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import ListBox from 'webapps-common/ui/components/forms/ListBox';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';

const DATA_TYPE = 'value';

/**
 * Implementation of the Single Selection Widget. Allows the user to select one item from a list of possible choices.
 * The view representation can either be a Dropdown, ListBox or RadioButtons.
 */
export default {
    components: {
        Fieldset,
        ListBox,
        Label,
        Dropdown,
        RadioButtons,
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
                [DATA_TYPE]: 0
            }),
            type: Object
        }
    },
    data() {
        return {
            viewRep: this.nodeConfig.viewRepresentation
        };
    },
    computed: {
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
            return 0;
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
            return this.valuePair[DATA_TYPE][0];
        },
        isList() {
            return this.viewRep.type === 'List';
        },
        isDropdown() {
            return this.viewRep.type === 'Dropdown';
        },
        isRadioButtons() {
            return this.viewRep.type === 'Radio buttons (vertical)' ||
                this.viewRep.type === 'Radio buttons (horizontal)';
        },
        radioButtonsAlignment() {
            if (this.viewRep.type === 'Radio buttons (vertical)') {
                return 'vertical';
            } else if (this.viewRep.type === 'Radio buttons (horizontal)') {
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
                value: [value]
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
  <div class="single-select-widget">
    <Fieldset
      v-if="isRadioButtons"
      :text="label"
      class="fieldset"
    >
      <RadioButtons
        v-if="isRadioButtons"
        ref="form"
        :alignment="radioButtonsAlignment"
        :value="value"
        :possible-values="possibleChoices"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Fieldset>
    <Label
      v-if="!isRadioButtons"
      :text="label"
    >
      <ListBox
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
      <Dropdown
        v-if="isDropdown"
        ref="form"
        :value="value"
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
.single-select-widget {
  & .fieldset {
    min-width: auto;
    overflow-x: hidden;
  }
}
</style>
