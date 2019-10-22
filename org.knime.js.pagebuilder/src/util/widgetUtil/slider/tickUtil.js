import { format } from '../../numStrFormatter';
import { createSubTicks } from './subTickUtil';

/**
 * This utility function provides the functionality for the
 * SliderWidget to parse the user provided options into a
 * correctly formatted Object holding the ticks in the proper
 * format to be passed to the Slider input component.
 * 
 * @param  {Object} tickConfig - the config object for the ticks
 *          of the slider as created by the SliderWidget.
 * @param  {Object} tickConfig.config - the sub-object provided
 *          by the nodeConfig for the slider widget; specifically
 *          the ...sliderSettings.pips (which contains the tick-
 *          related options).
 * @param  {String} tickConfig.config.mode - the user defined method
 *          of applying ticks to the slider.
 * @param  {Object} [tickConfig.config.format] - the configuration
 *          for the formatting of tick labels. (see util/numStrFormatter
 *          .js : format() for all possible keys).
 * @param  {Number} [tickConfig.config.density] - the user provided
 *          value for the 'density'setting; this essentially sets the
 *          'preferred' frequency of ticks on the slider. The number
 *          represents the distance as a percent of the whole slider
 *          where the user would like to see a tick (labelled or
 *          unlabeled).
 * @param  {Boolean} [tickConfig.config.stepped] - if the labels should
 *          be stepped.
 * @param  {Number[]} [tickConfig.config.values] - the values to be
 *          included as labels on the slider.
 * @param  {Number} tickConfig.min - the config object for the ticks.
 * @param  {Number} tickConfig.max - the config object for the ticks.
 * @param  {String} tickConfig.direction - the direction of the slider.
 * @param  {Number} [tickConfig.stepSize] - the optionally provided size
 *          of the steps for the slider.
 * @returns {Object} markConfig - the object holding the properly spaced
 *          labelled and formatted ticks for the slider.
 */
export const createTicks = (tickConfig) => {
    const { config, min, max, direction, stepSize } = tickConfig;
    let markConfig = {};
    const orderedValues = new Set([min]);
    if (config) {
        switch (config.mode) {
        case 'steps':
        case 'count': {
            const step = config.mode === 'steps'
                ? Number(stepSize)
                : (max - min) / config.values[0];
            for (let i = 0; i < (max - min) / step; i++) {
                let val = min + step * i;
                markConfig[val] = `${format(val, config.format)}`;
                orderedValues.add(val);
            }
            markConfig[max] = `${format(max, config.format)}`;
            break;
        }
        case 'values': {
            config.values.forEach((val) => {
                markConfig[val] = `${format(val, config.format)}`;
                orderedValues.add(val);
            });
            break;
        }
        case 'range':
            markConfig[min] = `${format(min, config.format)}`;
            markConfig[max] = `${format(max, config.format)}`;
            break;
        case 'positions': {
            config.values.forEach((val) => {
                let key = max * (val / 100); // || min;
                markConfig[key] = `${format(key, config.format)}`;
                orderedValues.add(key);
            });
            break;
        }
        default:
          // nothing
        }
        const subTickConfig = {
            min,
            max,
            direction,
            density: config.density
        };
        orderedValues.add(max);
        createSubTicks(markConfig, orderedValues, subTickConfig);
    }
    return markConfig;
};

