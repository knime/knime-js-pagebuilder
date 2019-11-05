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
            const classes = ['knime-qf-input', 'knime-single-line'];
            switch (this.type) {
            case 'text':
                classes.push('knime-string');
                break;
            default:
                  //  nothing
            }
            if (!this.isValid) {
                classes.push('knime-input-invalid');
            }
            return classes;
        }
    },
    mounted() {
        this.$el.value = this.value;
        this.onValueChange({});
    },
    methods: {
        getValue() {
            return this.$el.value;
        },
        onValueChange(e) {
            this.$emit('updateValue', {
                val: this.getValue(),
                originalEvent: e,
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
  <!-- knime-qf-input legacy selector -->
  <input
    :class="inputClass"
    :type="type"
    :pattern="pattern"
    :placeholder="placeholder"
    @change="onValueChange"
  >
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

input.knime-qf-input {
  font-family: 'Roboto', BlinkMacSystemFont, -apple-system, 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
    'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--theme-color-masala);
  letter-spacing: 0.03px;
  line-height: 18px;
  background-color: var(--theme-color-porcelain);
  margin: 0;
  padding: 11px 10px 11px 10px;
  border-radius: 0;
  width: 100%;
  min-width: 100px;
  max-width: 400px;
  border: none;
  outline: none;
}

input.knime-input-invalid {
  border-left-width: 3px;
  border-left-color: var(--theme-color-error);
  border-left-style: solid;
}
</style>

