<script>
import TextArea from 'webapps-common/ui/components/forms/TextArea.vue';
import Label from 'webapps-common/ui/components/forms/Label.vue';
import ErrorMessage from '../baseElements/text/ErrorMessage.vue';

const DATA_TYPE = 'string';

/**
 * ListBox Input Widget. Shows a textarea which contains list items separated by a separator char. This can be
 * line ending or something else. It supports separation by every single char. Supports regex based validation with
 * user configurable error messages.
 */
export default {
    components: {
        Label,
        TextArea,
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
                [DATA_TYPE]: ''
            }),
            type: Object
        },
        errorMessage: {
            type: String,
            default: null
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
            return this.viewRep.description || null;
        },
        value() {
            return this.valuePair[DATA_TYPE];
        },
        regex() {
            return this.viewRep.regex || null;
        },
        viewErrorMessage() {
            return this.viewRep.errormessage || null;
        },
        separator() {
            return this.viewRep.separator || null;
        },
        separateEachCharacter() {
            return this.viewRep.separateeachcharacter || false;
        },
        omitEmpty() {
            return this.viewRep.omitempty || false;
        },
        numberVisOptions() {
            return this.viewRep.numberVisOptions;
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
        getSplitValues() {
            let value = this.$refs.form.getValue();
            if (!value) {
                return [];
            }
            // fix separator
            let sep = this.separator === '\\n' ? '\n' : this.separator;
            // split by each char or by sep
            let valuesArray = value.split(this.separateEachCharacter ? '' : sep);

            // remove empty valuesArray
            if (this.omitEmpty) {
                valuesArray = valuesArray.filter(x => x !== '');
            }

            return valuesArray;
        },
        validate() {
            let values = this.getSplitValues();
            let err = (msg, item) => ({
                isValid: false,
                errorMessage: item ? msg.replace('?', item) : msg
            });
            // required
            if (this.viewRep.required) {
                if (!this.$refs.form.getValue()) {
                    return err('Input is required.');
                }
            }
            // regex
            if (this.regex) {
                for (let i = 0; i < values.length; i++) {
                    const matches = values[i].match(new RegExp(`^(?:${this.regex})$`, 'u'));
                    let matchingRegex = matches !== null && matches[0] === values[i];
                    if (!matchingRegex) {
                        return err([`Value ${i + 1} is not valid.`,
                            this.viewErrorMessage].filter(Boolean).join(' '), values[i]);
                    }
                }
            }
            // all ok
            return {
                isValid: true,
                errorMessage: null
            };
        }
    }
};
</script>

<template>
  <div class="listBoxInput">
    <Label
      :text="label"
    >
      <template #default="{ labelForId }">
        <TextArea
          :id="labelForId"
          ref="form"
          :value="value"
          :cols="20"
          :rows="numberVisOptions"
          :is-valid="isValid"
          :title="description"
          @input="onChange"
        />
        <ErrorMessage :error="errorMessage" />
      </template>
    </Label>
  </div>
</template>

<style lang="postcss" scoped>
.listBoxInput {
  & :deep(textarea) {
    width: 100%;
    max-width: 100%;
  }

  & :deep(label) {
    cursor: pointer;
  }
}
</style>
