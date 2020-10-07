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
            serverUser: {
                username: null,
                password: null
            },
            serverCredentialsFetchError: false,
            serverCredentialsErrorMessage: SERVER_ERROR_MESSAGE
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
        regex() {
            return this.viewRep.regex || null;
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
            return this.useServerLoginCredentials ? this.serverUser || this.valuePair : this.valuePair;
        }
    },
    async mounted() {
        await this.getServerUser();
    },
    methods: {
        async getServerUser() {
            if (this.useServerLoginCredentials) {
                let getUserFunc = await this.$store.getters['api/user'];
                getUserFunc().then((value) => {
                    this.serverUser = value;
                }).catch(() => {
                    this.serverCredentialsFetchError = true;
                    if (!this.noDisplay) {
                        this.serverUser = { ...this.valuePair, username: null, password: null };
                    }
                    this.$parent.validate();
                });
            }
        },
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                // TODO: find better solution
                // eslint-disable-next-line no-restricted-globals
                type: event.target.type === 'password' ? 'password' : 'username',
                value
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            let isValid = true;
            let errorMessage;

            if (this.promptUsername
                ? !this.$refs.usernameForm.getValue() || !this.$refs.passwordForm.getValue()
                : !this.$refs.passwordForm.getValue()) {
                this.serverCredentialsErrorMessage = SERVER_ERROR_MESSAGE;
                if (this.viewRep.required) {
                    isValid = false;
                    errorMessage = 'Input required.';
                }
            } else {
                this.serverCredentialsErrorMessage = null;
            }

            if (typeof this.$refs.passwordForm.validate === 'function') {
                let validateEvent = this.$refs.passwordForm.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage;
            }

            if (this.promptUsername && typeof this.$refs.usernameForm.validate === 'function') {
                let validateEvent = this.$refs.usernameForm.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage || errorMessage || 'Current input is invalid.';
            }

            this.serverCredentialsErrorMessage = this.serverCredentialsFetchError
                ? this.serverCredentialsErrorMessage
                : null;

            return { isValid, errorMessage: isValid ? this.serverCredentialsErrorMessage : errorMessage };
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
        ref="passwordForm"
        type="password"
        :value="value.password"
        :is-valid="isValid"
        :title="description"
        :pattern="regex"
        @input="onChange"
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
