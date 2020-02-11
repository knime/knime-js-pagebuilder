<script>
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import MultiselectListBox from 'webapps-common/ui/components/forms/MultiselectListBox';
import Twinlist from 'webapps-common/ui/components/forms/Twinlist';
import Fieldset from 'webapps-common/ui/components/forms/Fieldset';
import Checkboxes from 'webapps-common/ui/components/forms/Checkboxes';

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
            return '';
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
            // TODO: this validate function is called BEFORE the value really changed - why?
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
    <Fieldset
      v-if="isCheckboxes"
      :text="label"
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
      <Twinlist
        v-if="isTwinlist"
        ref="form"
        :value="value"
        :size="maxVisibleListEntries"
        aria-label-left="Excludes"
        aria-label-right="Includes"
        :possible-values="possibleChoices"
        :is-valid="isValid"
        :title="description"
        @input="onChange"
      />
      <ErrorMessage :error="errorMessage" />
    </Label>
  </div>
</template>
