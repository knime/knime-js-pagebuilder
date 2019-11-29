export default {
    // input widgets
    'org.knime.js.base.node.widget.input.slider.SliderWidgetNodeRepresentation': 'SliderWidget',
    'org.knime.js.base.node.base.input.string.StringNodeRepresentation': 'StringWidget',
    'org.knime.js.base.node.base.input.dbl.DoubleNodeRepresentation': 'DoubleWidget',
    'org.knime.js.base.node.base.input.integer.IntegerNodeRepresentation': 'IntegerWidget',
    'org.knime.js.base.node.base.input.bool.BooleanNodeRepresentation': 'BooleanWidget',

    // output widgets
    'org.knime.js.base.node.output.text.TextOutputRepresentation': 'TextWidget',

    // register the components which don't have value getters to register with store (i.e. output widgets)
    preventValueGetterRegistration: ['TextWidget']
};
