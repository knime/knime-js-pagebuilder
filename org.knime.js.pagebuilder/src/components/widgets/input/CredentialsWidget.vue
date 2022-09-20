<script>
import Fieldset from 'webapps-common/ui/components/forms/Fieldset.vue';
import Label from 'webapps-common/ui/components/forms/Label.vue';
import ErrorMessage from '../baseElements/text/ErrorMessage.vue';
import InputField from 'webapps-common/ui/components/forms/InputField.vue';

const SERVER_ERROR_MESSAGE = 'KNIME Server login credentials could not be fetched!';
const DEFAULT_ERROR_MESSAGE = 'Please correct input for ';

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
            serverCredentialsErrorMessage: null,
            useMagicPassword: true
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
        onChange() {
            // placeholder method for Widget framework
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
            this.useMagicPassword = false;
            if (value !== this.viewRep.defaultValue.magicDefaultPassword) {
                const changeEventObj = {
                    nodeId: this.nodeId,
                    type: 'magicDefaultPassword',
                    value
                };
                this.$emit('updateWidget', changeEventObj);
            }
        },
        validate() {
            let passwordForm = this.$refs.passwordForm;
            let usernameForm = this.$refs.usernameForm;
            let { isValid } = passwordForm.validate();
            let errorMessage = isValid ? '' : `${DEFAULT_ERROR_MESSAGE}password.`;
            if (this.promptUsername) {
                let { isValid: userIsValid } = usernameForm.validate();
                if (!userIsValid) {
                    isValid = false;
                    errorMessage = `${DEFAULT_ERROR_MESSAGE}username${errorMessage ? ' and password' : ''}.`;
                }
            }
            if (this.useServerLoginCredentials && this.serverCredentialsFetchError) {
                this.serverCredentialsErrorMessage = SERVER_ERROR_MESSAGE;
            }
            return { isValid, errorMessage };
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
      #default="{ labelForId }"
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
      #default="{ labelForId }"
      class="label"
      text="Password"
    >
      <InputField
        :id="labelForId"
        ref="passwordForm"
        type="password"
        :value="value.magicDefaultPassword"
        :is-valid="isValid"
        :title="description"
        @input="onPasswordChange"
      />
    </Label>
    <ErrorMessage
      class="error-message"
      :error="errorMessage || serverCredentialsErrorMessage"
    />
  </Fieldset>
</template>

<style lang="postcss" scoped>
.hide >>> *:not(:last-child) {
  display: none;
}
</style>
