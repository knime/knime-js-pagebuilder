<script>
import { mapGetters, mapActions } from 'vuex';
import WidgetConfig from './config';

/**
 * A Widget node view
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
		//Knime Method
		init(rep) {
			/* nothing to do yet */
		},
		//Knime Method
		setValidationErrorMessage(message) {
			/* nothing to do yet */
		},
		//Knime Method
		value() {
			/* nothing to do yet */
		},
		//Knime Method
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
