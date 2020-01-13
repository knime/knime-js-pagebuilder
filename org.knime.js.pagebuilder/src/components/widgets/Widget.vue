<script>
import { mapActions } from 'vuex';
import { classToComponentMap } from './widgets.config';
// input widgets
import BooleanWidget from './input/BooleanWidget';
import IntegerWidget from './input/IntegerWidget';
import DoubleWidget from './input/DoubleWidget';
import StringWidget from './input/StringWidget';
import SliderWidget from './input/SliderWidget';
// output widgets
import TextWidget from './output/TextWidget';
import { applyCustomCss } from '../../util/customCss';

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
 * package their own updated value and validity on the event object
 * passed to the parent Widget.
 *
 * This Widget component can then complete some last minute
 * verification before using the "updateValue" action to update
 * the store and validity of the page.
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
         * This method checks if the widget is compatible with the getValue method. Some widgets (like output widgets)
         * are static so they can't change their value.
         *
         * @returns {Boolean}
         */
        hasValueGetter() {
            return typeof this.$refs.widget.onChange === 'function';
        }
    },
    async mounted() {
        this.isValid = await this.validate().isValid;
        this.$store.dispatch('pagebuilder/addValidator', { nodeId: this.nodeId, validator: this.validate });
        // prevent incompatible widgets (i.e. output) from registering getter
        if (this.hasValueGetter) {
            this.$store.dispatch('pagebuilder/addValueGetter', { nodeId: this.nodeId, valueGetter: this.getValue });
        }
        applyCustomCss(this.$el, this.nodeConfig.customCSS);
    },
    beforeDestroy() {
        this.$store.dispatch('pagebuilder/removeValidator', { nodeId: this.nodeId });
        if (this.hasValueGetter) {
            this.$store.dispatch('pagebuilder/removeValueGetter', { nodeId: this.nodeId });
        }
    },
    methods: {
        publishUpdate(update) {
            this.isValid = this.$refs.widget.validate();
            this.updateValue(update);
        },
        getValue() {
            return new Promise((resolve, reject) => {
                try {
                    let value = this.$store.state.pagebuilder.page.wizardPageContent.webNodes[this.nodeId]
                        .viewRepresentation.currentValue;
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
        ...mapActions({
            updateValue: 'pagebuilder/updateWebNode'
        })
    }
};
</script>

<template>
  <!-- knime-qf-container legacy selector -->
  <div class="knime-widget knime-qf-container">
    <Component
      :is="type"
      ref="widget"
      v-bind="$props"
      :is-valid="isValid"
      @updateWidget="publishUpdate"
    />
  </div>
</template>

<style lang="postcss" scoped>
.knime-widget {
  width: 100%;
  height: 100%;
  background-color: white;
  border: none;
  overflow: hidden;
}
</style>
