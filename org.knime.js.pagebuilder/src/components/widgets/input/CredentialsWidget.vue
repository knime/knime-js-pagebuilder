<script>
import Fieldset from '~/webapps-common/ui/components/forms/Fieldset';
import Label from '~/webapps-common/ui/components/forms/Label';
import ErrorMessage from '../baseElements/text/ErrorMessage';
import InputField from '~/webapps-common/ui/components/forms/InputField';

const SERVER_ERROR_MESSAGE = 'KNIME Server login credentials could not be fetched!';

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
    data() {
        return {
            serverCredentialsFetchError: false,
            serverCredentialsErrorMessage: null
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
            return this.viewRep.description;
        },
        promptUsername() {
            return this.viewRep.promptUsername || false;
        },
        useServerLoginCredentials() {
            return this.viewRep.useServerLoginCredentials || false;
        },
        noDisplay() {
            return this.viewRep.noDisplay || false;
        },
        value() {
            return this.valuePair || this.viewRep.defaultValue;
        }
    },
    mounted() {
        this.checkServerCredentials();
    },
    methods: {
        checkServerCredentials() {
            /* TODO WEBP-563: reevaluate if this case could ever occur or
                if the error will get caught in earlier stages for sure. */
            if (this.useServerLoginCredentials && !this.viewRep.defaultValue) {
                this.serverCredentialsFetchError = true;
            }
        },
        /*
         *  This check makes sure only data gets sent that is different to the default value,
         *  if this is not the case no credentials will be sent and the backend uses the default value instead.
         */
        onUsernameChange(value) {
            if (value !== this.viewRep.defaultValue.username) {
                const changeEventObj = {
                    nodeId: this.nodeId,
                    type: 'username',
                    value
                };
                this.$emit('updateWidget', changeEventObj);
            }
        },
        /*
         * Same as onUsernameChange: only sends credentials if the input differs from the default values.
         */
        onPasswordChange(value) {
            if (value !== this.viewRep.defaultValue.magicDefaultPassword) {
                const changeEventObj = {
                    nodeId: this.nodeId,
                    type: 'password',
                    value
                };
                this.$emit('updateWidget', changeEventObj);
            }
        },
        validate() {
            let isValid = true;
            let errorMessage,
                validateEventUsername,
                validateEventPassword;

            if (this.promptUsername
                ? !this.$refs.usernameForm.getValue() || !this.$refs.passwordForm.getValue()
                : !this.$refs.passwordForm.getValue()) {
                this.serverCredentialsErrorMessage = SERVER_ERROR_MESSAGE;
                if (this.viewRep.required) {
                    isValid = false;
                    errorMessage = 'Input is required for both inputs.';
                }
            } else {
                this.serverCredentialsErrorMessage = null;
            }

            if (typeof this.$refs.passwordForm.validate === 'function') {
                validateEventPassword = this.$refs.passwordForm.validate();
                isValid = Boolean(validateEventPassword.isValid && isValid);
                errorMessage = validateEventPassword.errorMessage || errorMessage;
            }

            if (this.promptUsername && typeof this.$refs.usernameForm.validate === 'function') {
                validateEventUsername = this.$refs.usernameForm.validate();
                isValid = Boolean(validateEventUsername.isValid && isValid);
                errorMessage = validateEventUsername.errorMessage || errorMessage;
            }

            errorMessage = (this.promptUsername ? !validateEventUsername.isValid : true) &&
            !validateEventPassword.isValid
                ? `${errorMessage} for both inputs.`
                : errorMessage;

            this.serverCredentialsErrorMessage = this.serverCredentialsFetchError
                ? this.serverCredentialsErrorMessage
                : null;

            return {
                isValid,
                errorMessage: isValid ? this.serverCredentialsErrorMessage : errorMessage || 'Current input is invalid'
            };
        }
    }
};
</script>

<template>
  <Fieldset
    :class="[{'hide': noDisplay}]"
    :text="label"
  >
    <Label
      v-if="promptUsername"
      v-slot="{ labelForId }"
      class="label"
      text="User"
    >
      <InputField
        :id="labelForId"
        ref="usernameForm"
        :value="value.username"
        :is-valid="isValid"
        :title="description"
        @input="onUsernameChange"
      />
    </Label>
    <Label
      v-slot="{ labelForId }"
      class="label"
      text="Password"
    >
      <InputField
        :id="labelForId"
        ref="passwordForm"
        type="password"
        :value="useServerLoginCredentials ? value.magicDefaultPassword : value.password"
        :is-valid="isValid"
        :title="description"
        @input="onPasswordChange"
      />
    </Label>
    <ErrorMessage
      class="error-message"
      :error="errorMessage"
    />
  </Fieldset>
</template>

<style lang="postcss" scoped>
.hide >>> *:not(:last-child) {
  display: none;
}
</style>
