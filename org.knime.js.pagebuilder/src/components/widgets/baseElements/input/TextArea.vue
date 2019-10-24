<script>
/**
 * Default text area for widgets.
 */
export default {
    props: {
        value: {
            default: () => '',
            type: String
        },
        isValid: {
            default: () => false,
            type: Boolean
        },
        cols: {
            default: 12,
            type: Number
        },
        rows: {
            default: 4,
            type: Number
        },
        placeholder: {
            default: '',
            type: String
        }
    },
    computed: {
        textAreaClass() {
            const classes = ['knime-qf-input', 'knime-string', 'knime-multi-line'];
            if (!this.isValid) {
                classes.push('knime-textarea-invalid');
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
            return Boolean(this.getValue());
        }
    }
};
</script>

<template>
  <!-- knime-qf-input legacy selector -->
  <textarea
    :class="textAreaClass"
    :cols="cols"
    :rows="rows"
    :placeholder="placeholder"
    @change="onValueChange"
  />
</template>

<style lang="postcss" scoped>
@import "webapps-common/ui/css/variables";

textarea.knime-qf-input {
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
  border: none;
  outline: none;
}

textarea.knime-textarea-invalid {
  border-left-width: 3px;
  border-left-color: var(--theme-color-error);
  border-left-style: solid;
}
</style>

