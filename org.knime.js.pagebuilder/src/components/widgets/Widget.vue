<script>
import { mapActions } from 'vuex';
import { classToComponentMap } from './widgets.config';
// input widgets
import BooleanWidget from './input/BooleanWidget';
import IntegerWidget from './input/IntegerWidget';
import DoubleWidget from './input/DoubleWidget';
import StringWidget from './input/StringWidget';
import SliderWidget from './input/SliderWidget';
// selection widgets
import SingleSelectionWidget from './selection/SingleSelectionWidget';
import MultipleSelectionWidget from './selection/MultipleSelectionWidget';
import ColumnFilterSelectionWidget from './selection/ColumnFilterSelectionWidget';
import ColumnSelectionWidget from './selection/ColumnSelectionWidget';
import ValueSelectionWidget from './selection/ValueSelectionWidget';
// output widgets
import TextWidget from './output/TextWidget';

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
 *
 * The application of customCSS is also handled by this component.
 */
export default {
    components: {
        // input widgets
        BooleanWidget,
        IntegerWidget,
        DoubleWidget,
        StringWidget,
        SliderWidget,
        // selection widgets
        SingleSelectionWidget,
        MultipleSelectionWidget,
        ColumnFilterSelectionWidget,
        ColumnSelectionWidget,
        ValueSelectionWidget,
        // output widgets
        TextWidget
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
                return Boolean(nodeId);
            }
        }
    },
    data() {
        return {
            isValid: true
        };
    },
    computed: {
        type() {
            return classToComponentMap[this.nodeConfig.viewRepresentation['@class']];
        },
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
        }
    },
    async mounted() {
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
            await this.validate().then((resp, err) => {
                this.isValid = resp.isValid;
            });
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
            changeObj.update = {
                [`viewRepresentation.currentValue.${changeObj.type}`]: changeObj.value
            };
            this.updateWebNode(changeObj);
            if (this.hasValidator) {
                await this.validate().then((resp, err) => {
                    this.isValid = resp.isValid;
                });
            }
        },
        getValue() {
            return new Promise((resolve, reject) => {
                try {
                    let value = this.valuePair;
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
                let isValid;
                try {
                    isValid = this.$refs.widget.validate();
                    if (typeof isValid === 'undefined') {
                        throw new Error('Widget validation failed.');
                    }
                } catch (error) {
                    isValid = false;
                } finally {
                    resolve({ nodeId: this.nodeId, isValid });
                }
            });
        },
        setValidationError(errMsg) {
            return new Promise((resolve, reject) => {
                this.updateWebNode({
                    nodeId: this.nodeId,
                    update: {
                        'nodeInfo.nodeErrorMessage': errMsg
                    }
                });
                this.isValid = false;
                resolve();
            });
        },
        ...mapActions({
            updateWebNode: 'pagebuilder/updateWebNode'
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
  overflow: hidden;
}
</style>
