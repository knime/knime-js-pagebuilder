<script>
import RadioButtons from 'webapps-common/ui/components/forms/RadioButtons';
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import ListBox from 'webapps-common/ui/components/forms/ListBox';
import Dropdown from 'webapps-common/ui/components/forms/Dropdown';

const DATA_TYPE = 'value';

/**
 * This is the String Input widget implementation. At this component
 * level, the primary goal is to parse the view representation into
 * the necessary configuration values to render the correct input
 * element.
 *
 * This widget has two rendering options: a standard input field or
 * a text area.
 */
export default {
    components: {
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
            return this.viewRep.possibleChoices.map((x) => ({ id: x, text: x }));
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
            return '';
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
  <div>
    <Label
      :text="label"
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
div {
  overflow: hidden !important;
}
</style>
