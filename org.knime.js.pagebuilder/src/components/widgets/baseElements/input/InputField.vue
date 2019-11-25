<script>
/**
 * Default input field for widgets.
 */
export default {
    props: {
        value: {
            default: () => '',
            type: [Number, String]
        },
        isValid: {
            default: () => false,
            type: Boolean
        },
        type: {
            default: '',
            type: String
        },
        pattern: {
            default: '.*',
            type: String
        },
        placeholder: {
            default: '',
            type: String
        }
    },
    computed: {
        inputClass() {
            // knime-qf-input legacy selector
            const classes = ['knime-qf-input', 'knime-single-line'];
            if (this.type === 'text') {
                classes.push('knime-string');
            }
            if (!this.isValid) {
                classes.push('knime-input-invalid');
            }
            return classes;
        }
    },
    mounted() {
        this.onValueChange({});
    },
    methods: {
        getValue() {
            return this.$el.value;
        },
        onValueChange(e) {
            this.$emit('updateValue', {
                value: this.getValue(),
                isValid: this.validate()
            });
        },
        validate() {
            const matches = this.getValue().match(this.pattern);
            return matches !== null && matches[0] === this.getValue();
        }
    }
};
</script>

<template>
  <input
    :value="value"
    :class="inputClass"
    :type="type"
    :pattern="pattern"
    :placeholder="placeholder"
    @input="onValueChange"
  >
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

input.knime-qf-input {
  font-size: 13px;
  font-weight: 500;
  color: var(--theme-color-masala);
  line-height: 18px;
  background-color: var(--theme-color-porcelain);
  margin: 0;
  padding: 11px 10px 11px 10px;
  border-radius: 0;
  width: 100%;
  border-left-width: 3px;
  border-color: transparent;
  border-left-style: solid;
  outline: none;
  border-top: none;
  border-bottom: none;
}

input.knime-input-invalid {
  border-left-color: var(--theme-color-error);
}
</style>

