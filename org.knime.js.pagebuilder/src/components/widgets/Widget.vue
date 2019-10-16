<script>
import { mapGetters, mapActions } from 'vuex';
import WidgetConfig from './config';

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
 */
export default {
	components: {

	},
	props: {
		/**
		 * Node configuration as received by API
		 */
		nodeConfig: {
			default: () => ({}),
			type: Object
		},
		/**
		 * The unique string node ID as it exists
		 * in the store webNodes
		 */
		nodeId: {
			default: () => null,
			type: String
    }
	},
	computed: {
		type() {
			return WidgetConfig[this.nodeConfig.viewRepresentation['@class']].type;
		},
		...mapGetters({
			isValid: 'pagebuilder/isNodeValid'
		})
	},
	methods: {
		validate(value) {
			/**
			 * TODO: SRV-2626
			 * 
			 * insert additional custom widget validation
			 * currently fake validation
			 */
			return true;
		},
		publishUpdate(update) {
			update.isValid = update.isValid && this.validate(update);
			this.updateValue(update);
		},
		...mapActions({ 
			updateValue: 'pagebuilder/updateWebNode',
		}),
	},
};
</script>

<template>
	<div class="knime-widget">
		<Component 
			:is="type"
			v-bind="$props"
			:is-valid="isValid(nodeId)"
			v-on:updateWidget="publishUpdate"
		/>
	</div>
</template>

<style lang="postcss" scoped>
.knime-widget {
	width: 100%;
	height: 100%;
	background-color: white;
	border: none;
}
</style>
