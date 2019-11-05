/**
 * Utility function to add the KNIME classes to the SLider component.
 *
 * @param  {Element} sliderElement - the element vue-slider-component.
 * @returns {undefined}
 */
export const addKnimeClasses = (sliderElement) => {
    try {
        let checkAndAddClass = (el, className) => {
            if (el) {
                el.classList.add(className);
                return true;
            }
            return false;
        };
        let sliderBase = sliderElement.childNodes[0];
        if (checkAndAddClass(sliderBase, 'knime-slider-base')) {

            // slider connect
            checkAndAddClass(sliderBase.childNodes[0], 'knime-slider-connect');

            // slider ticks
            let tickContainer = sliderBase.childNodes[1];
            if (checkAndAddClass(tickContainer, 'knime-tick')) {
                tickContainer.childNodes.forEach(tickEl => {
                    // tick lines
                    checkAndAddClass(tickEl.querySelector('.vue-slider-mark-step'), 'knime-tick-line');

                    // labels
                    checkAndAddClass(tickEl.querySelector('.vue-slider-mark-label'), 'knime-tick-label');
                });
            }

            // slider handle
            let sliderHandle = sliderBase.childNodes[2];
            if (checkAndAddClass(sliderHandle, 'knime-slider-handle')) {

                // tooltips
                let tooltipEl = sliderHandle.querySelector('.vue-slider-dot-tooltip');
                if (checkAndAddClass(tooltipEl, 'knime-tooltip')) {

                    // tooltip value
                    checkAndAddClass(tooltipEl.childNodes[0], 'knime-tooltip-value');
                }
            }
        }
    } catch (e) {
        // eslint-disable-next-line no-warning-comments
        // TODO: AP-12954 publish warning that KNIME CSS classes could not be loaded.
    }
};
