<script>
import Fieldset from '~/webapps-common/ui/components/forms/Fieldset';
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import InputField from '~/webapps-common/ui/components/forms/InputField';

const DATA_TYPE = 'Object';

export default {
    components: {
        Fieldset,
        Label,
        InputField,
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
                return nodeId !== '';
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({}),
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
        regex() {
            return this.viewRep.regex || null;
        },
        promptUsername() {
            return this.viewRep.promptUsername || false;
        },
        useServerLoginCredentials() {
            return this.viewRep.useServerLoginCredentials || false;
        },
        value() {
            return this.valuePair;
        }
    },
    methods: {
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE,
                value: { ...this.value, ...this.usernameChanged(event) ? { username: value } : { password: value } }
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            let isValid = true;
            let errorMessage;
            if (this.viewRep.required && !this.$refs.from.getValue()) {
                isValid = false;
                errorMessage = 'Input is required.';
            }
            if (typeof this.$refs.form.validate === 'function') {
                let validateEvent = this.$refs.form.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage || errorMessage || 'Current input is invalid.';
            }
            return { isValid, errorMessage: isValid ? null : errorMessage };
        },
        isUsername(event) {
            return true;
        }
    }
};
</script>

<template>
  <Fieldset :text="label">
    <Label
      v-if="promptUsername"
      v-slot="{ labelForId }"
      class="label"
      text="User"
    >
      <InputField
        :id="labelForId"
        ref="form"
        :value="value.username"
        :is-valid="isValid"
        :title="description"
        :pattern="regex"
        @input="onChange"
      />
    </Label>
    <Label
      v-slot="{ labelForId }"
      class="label"
      text="Password"
    >
      <InputField
        :id="labelForId"
        ref="form"
        type="password"
        :value="value.password"
        :is-valid="isValid"
        :title="description"
        :pattern="regex"
        @input="onChange"
      />
    </Label>
    <ErrorMessage :error="errorMessage" />
  </Fieldset>
</template>

<style lang="postcss" scoped>

</style>
