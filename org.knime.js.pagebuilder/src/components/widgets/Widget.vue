<script>
import { mapActions } from 'vuex';
// input widgets
import BooleanWidget from './input/BooleanWidget.vue';
import IntegerWidget from './input/IntegerWidget.vue';
import DoubleWidget from './input/DoubleWidget.vue';
import StringWidget from './input/StringWidget.vue';
import SliderWidget from './input/SliderWidget.vue';
import ListBoxInputWidget from './input/ListBoxInputWidget.vue';
import CredentialsWidget from './input/CredentialsWidget.vue';
import DateTimeWidget from './input/DateTimeWidget.vue';
import FileUploadWidget from './input/FileUploadWidget.vue';
// selection widgets
import SingleSelectionWidget from './selection/SingleSelectionWidget.vue';
import MultipleSelectionWidget from './selection/MultipleSelectionWidget.vue';
import ColumnFilterSelectionWidget from './selection/ColumnFilterSelectionWidget.vue';
import ColumnSelectionWidget from './selection/ColumnSelectionWidget.vue';
import ValueFilterSelectionWidget from './selection/ValueFilterSelectionWidget.vue';
import ValueSelectionWidget from './selection/ValueSelectionWidget.vue';
import FileChooserWidget from './selection/FileChooserWidget.vue';
// output widgets
import TextWidget from './output/TextWidget.vue';
import ImageWidget from './output/ImageWidget.vue';
import FileDownloadWidget from './output/FileDownloadWidget.vue';
// interactive widgets
import InteractiveValueWidget from './interactive/InteractiveValueWidget.vue';
import InteractiveRangeWidget from './interactive/InteractiveRangeWidget.vue';
// reactive widgets
import RefreshButtonWidget from './reactive/RefreshButtonWidget.vue';

/**
 * A Widget node view. This top level component sits at
 * the same level as would a NodeViewIFrame component and
 * is specifically designed to be the parent component of
 * all individual widget implementations.
 *
 * This parent-of-widgets component controls the invocation
 * of actions from the Vuex store. Each instance of this Widget
 * component is listening for an "updateWidget" event from its child
 * component. The children of the Widget instance will parse and
 * package their own updated value on the event object passed to the
 * parent Widget.
 *
 * This Widget component can then complete some last minute
 * verification before using the "updateWebNode" action to update
 * the store.
 *
 * This component should fill its parent container. Avoid styling
 * this component. This serves primarily as a separation of
 * concerns between the Vuex store and individual widget
 * implementations, allowing each unique child to agnostically
 * handle their own nodeConfig objects and values/validations.
 *
 * The type of the child of this component is determined through
 * the computed property type, as all widget class names are
 * mapped in a config file.
 */
export default {
    components: {
        // input widgets
        BooleanWidget,
        IntegerWidget,
        DoubleWidget,
        StringWidget,
        SliderWidget,
        ListBoxInputWidget,
        CredentialsWidget,
        DateTimeWidget,
        FileUploadWidget,
        // selection widgets
        SingleSelectionWidget,
        MultipleSelectionWidget,
        ColumnFilterSelectionWidget,
        ColumnSelectionWidget,
        ValueFilterSelectionWidget,
        ValueSelectionWidget,
        FileChooserWidget,
        // output widgets
        TextWidget,
        ImageWidget,
        FileDownloadWidget,
        // interactive widgets
        InteractiveValueWidget,
        InteractiveRangeWidget,
        // reactive widgets
        RefreshButtonWidget
    },
    props: {
        /**
         * Node configuration as received by API
         */
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.viewRepresentation && obj.viewRepresentation['@class'];
            }
        },
        /**
         * The unique string node ID as it exists
         * in the store webNodes
         */
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        },
        /**
         * The Vue Widget Component name as mapped to the node settings.
         */
        type: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        }
    },
    data() {
        return {
            isValid: true,
            errorMessage: null,
            serverValidationErrorMessage: null
        };
    },
    computed: {
        /**
         * Check for a validator. Some widgets (like output widgets) are static so they don't need to be validated.
         *
         * @returns {Boolean}
         */
        hasValidator() {
            return typeof this.$refs.widget.validate === 'function';
        },
        /**
         * This method checks if the widget is compatible with the getValue method. Some widgets (like output widgets)
         * are static so they can't change their value.
         *
         * @returns {Boolean}
         */
        hasValueGetter() {
            return typeof this.$refs.widget.onChange === 'function';
        },
        /**
         * Check for valid nodeConfig for setting validation failure messages.
         *
         * @returns {Boolean}
         */
        hasValidationErrorMessage() {
            return typeof this.nodeConfig.nodeInfo !== 'undefined';
        },
        valuePair() {
            return this.nodeConfig.viewRepresentation.currentValue;
        },
        isInteractiveWidget() {
            return typeof this.valuePair === 'undefined' && typeof this.$refs.widget.getValue === 'function';
        },
        /* Method to recognize all re-execution widgets as widgets which are configured to be
        reactive. */
        isReactive() {
            return this.nodeConfig.viewRepresentation.triggerReExecution;
        }
    },
    async mounted() {
        // TODO WEBP-182 File Upload Vue Widget should be required; WEBP-327 Remove if dialog option added.
        if (this.nodeConfig.viewRepresentation.required) {
            this.updateWebNode({
                nodeId: this.nodeId,
                update: {
                    'viewRepresentation.required': false
                }
            });
        }
        // prevent incompatible widgets (i.e. output) from registering methods with store
        if (this.hasValidationErrorMessage) {
            this.$store.dispatch('pagebuilder/addValidationErrorSetter', {
                nodeId: this.nodeId,
                errorSetter: this.setValidationError
            });
        }
        if (this.hasValueGetter) {
            this.$store.dispatch('pagebuilder/addValueGetter', { nodeId: this.nodeId, valueGetter: this.getValue });
        }
        if (this.hasValidator) {
            this.$store.dispatch('pagebuilder/addValidator', { nodeId: this.nodeId, validator: this.validate });
            await this.validate();
        }
    },
    beforeDestroy() {
        if (this.hasValidationErrorMessage) {
            this.$store.dispatch('pagebuilder/removeValidationErrorSetter', {
                nodeId: this.nodeId
            });
        }
        if (this.hasValidator) {
            this.$store.dispatch('pagebuilder/removeValidator', { nodeId: this.nodeId });
        }
        if (this.hasValueGetter) {
            this.$store.dispatch('pagebuilder/removeValueGetter', { nodeId: this.nodeId });
        }
    },
    methods: {
        async publishUpdate(changeObj) {
            if (this.hasValueGetter && !changeObj.update) {
                changeObj.update = {
                    [`viewRepresentation.currentValue.${changeObj.type}`]: changeObj.value
                };
            }
            if (changeObj.update) {
                await this.updateWebNode(changeObj);
            }
            if (changeObj.update && this.hasValidator) {
                await this.validate();
            }
            if (typeof changeObj.callback === 'function') {
                changeObj.callback();
            }
            if (this.isReactive && this.isValid) {
                this.triggerReExecution({ nodeId: this.nodeId });
            }
        },
        getValue() {
            return new Promise((resolve, reject) => {
                try {
                    let value = this.isInteractiveWidget ? this.$refs.widget.getValue() : this.valuePair;
                    if (typeof value === 'undefined') {
                        reject(new Error('Value of widget could not be retrieved.'));
                    } else {
                        resolve({ nodeId: this.nodeId, value });
                    }
                } catch (error) {
                    reject(new Error(error));
                }
            });
        },
        validate() {
            return new Promise((resolve, reject) => {
                let isValid = true;
                let errorMessage = null;
                try {
                    ({ isValid, errorMessage } = this.$refs.widget.validate());
                } catch (error) {
                    isValid = false;
                    errorMessage = 'Something is not right. Please check this element.';
                } finally {
                    this.isValid = isValid;
                    this.errorMessage = errorMessage;
                    resolve({ nodeId: this.nodeId, isValid, errorMessage });
                }
            });
        },
        setValidationError(errMsg) {
            return new Promise((resolve, reject) => {
                this.serverValidationErrorMessage = errMsg;
                this.isValid = false;
                resolve();
            });
        },
        ...mapActions({
            updateWebNode: 'pagebuilder/updateWebNode',
            triggerReExecution: 'pagebuilder/triggerReExecution'
        })
    }
};
</script>

<template>
  <div class="widget">
    <Component
      :is="type"
      ref="widget"
      v-bind="$props"
      :is-valid="isValid"
      :value-pair="valuePair"
      :error-message="serverValidationErrorMessage || errorMessage"
      @updateWidget="publishUpdate"
    />
  </div>
</template>

<style lang="postcss" scoped>
.widget {
  width: 100%;
  height: 100%;
  background-color: white;
  border: none;
  padding-top: 10px; /* provides default spacing between page content */
}
</style>
