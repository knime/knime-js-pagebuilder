/**
 * This generator function is used anytime sub-ticks are
 * created. It styles the tick based on the provided
 * length and the direction; which is used to determine if
 * the length will be used for the height or the width.
 * 
 * @param  {Number} length - the length of the tick in pixels.
 * @param  {String} direction - the direction of the slider.
 * @returns {Object} tick - the tick object.
 */
const newTick = (length, direction) => {
    const styleKey = direction.includes('b')
        ? 'width'
        : 'height';
    return {
        label: '',
        style: {
            [styleKey]: `${length}px !important`
        },
        labelStyle: {
            display: 'none'
        }
    };
};

/**
 * This utility is used to dynamically assign different
 * lengths to the ticks in a sub-sequence on the slider.
 * It assigns the first tick, last tick and any tick in an
 * even-numbered tick to 5 pixels (smallest), the middle tick
 * in an odd-numbered sequence to 8 pixels (longest non-min/max),
 * any even-numbered tick in an odd-numbered sequence to 6 pixels
 * (middle), and all others (odd-numbered ticks in odd sequences
 * that are not the absolute median tick) to a default 5 pixels
 * (smallest).
 * 
 * @param  {Number} ind - the index of the tick in the sequence.
 * @param  {Number} numTick - the total number of ticks in the sequence.
 * @returns {Number} length - the appropriate length(px) for the tick.
 */
const getTickSize = (ind, numTick) => {
    switch (true) {
    case  ind === 0:
    case  ind === numTick:
    case  numTick % 2 === 0:
        return 5;
    case  Math.ceil(numTick / 2) === ind:
        return 8;
    case  ind % 2 === 0:
        return 6;
    default:
        return 5;
    }
};

/**
 * Utility function to apply subticks to the tick object of the slider.
 * The legacy quickform/widget slider library used something very similar
 * as a way to always make the ticks appear to be evenly spaced, even when
 * the user has settings which create irregularly spaced labeled ticks.
 * This functionality checks to see if there is 'room' between the two most
 * recent labeled ticks and then calculates the ideal distance to space these
 * ticks based on the ideal number of ticks specified by the user with the
 * density config option.
 * 
 * @param  {Object} tickObj - the object holding all of the ticks as key/value
 *          pairs.
 * @param  {Object} intervalConfig - the config holding the required information.
 * @param  {Number} intervalConfig.prevValue - the value of the previous labeled tick;
 *          used as the starting point for applying subticks to the slider.
 * @param  {Object} intervalConfig.diff - the iterator.next() object from the iterable
 *          containing the numeric difference between the prevValue labeled tick and the
 *          next labeled tick value. Used as the total distance on the slider for the sub-
 *          ticks to cover.
 * @param  {Number} intervalConfig.diff.value - the numeric difference between the prevValue
 *          labeled tick and the next labeled tick value. Used as the total distance on the
 *          slider for the subticks to cover.
 * @param  {String} intervalConfig.direction - the direction of the slider.
 * @param  {Number} intervalConfig.densitySize - the calculated number of ideal ticks across
 *          the whole slider based on the user provided density value.
 * @returns {Number} subticks - the number of subticks to subtract from the
 *          preferred tick density total calculated by the calling function.
 */
const addSubInterval = (tickObj, intervalConfig) => {
    const { prevValue, diff, direction, densitySize } = intervalConfig;
    // the ideal number of steps for this sub-interval, rounded down
    // to account for the beginning tick.
    let subSteps = Math.floor(diff.value / densitySize);
    // size of the substep.
    let stepSize = diff.value / subSteps;
    // skipping the first subtick (which is the previously labeled tick)
    // add the subticks to the tick object if they don't already exist.
    for (let i = 1; i < subSteps; i++) {
        let val = prevValue + stepSize * i;
        // calculate tick size to give the slider a more polished look.
        let tickSize = getTickSize(i, subSteps - 1);
        if (typeof tickObj[val] === 'undefined') {
            tickObj[val] = newTick(tickSize, direction);
        }
    }
    // return the number of subSteps added to be accounted for by the
    // tick count for the entire slider.
    return subSteps;
};

/**
 * This utility creates the unlabeled subticks on the slider depending on the
 * user supplied density measure.
 * 
 * @param  {Object} tickObj - the object holding all of the ticks as key/value
 *          pairs.
 * @param  {Set} vals - the ordered collection (Set) of all the existing numberic values
 *          of the labels for the slider in ascending order (as they appear on the
 *          slider).
 * @param  {Object} subTickConfig - the configuration options for the subticks of
 *          the slider.
 * @param  {Number} subTickConfig.min - the minimum value on the slider.
 * @param  {Number} subTickConfig.max - the maximum value on the slider.
 * @param  {String} intervalConfig.direction - the direction of the slider.
 * @param  {Number} subTickConfig.density - the user provided value for the 'density'
 *          setting; this essentially sets the 'preferred' frequency of ticks on the
 *          slider. The number represents the distance as a percent of the whole slider
 *          where the user would like to see a tick (labelled or unlabeled).
 * @returns {undefined} - nothing is returned as the function operates on the
 *          provided tickObj.
 */
export const createSubTicks = (tickObj, vals, subTickConfig) => {
    const { min, max, direction, density } = subTickConfig;
    // if the user requested ticks via density
    if (density) {
        // if the user has an empty slider (no labels) but
        // indicated they want ticks via the density option,
        // add master ticks for the min and max values.
        if (!tickObj[min]) {
            tickObj[min] = newTick(11, direction);
        }
        if (!tickObj[max]) {
            tickObj[max] = newTick(11, direction);
        }
        // get an array of all the numeric values of the ticks as the
        // sit on the slider (even unlabeled sliders will have min
        // and max in this array).
        const labelValues = Array.from(vals);
        // calculate the preferred number of steps.
        let numSteps = 100 / density;
        // find what the total number of steps would be if preffered
        // steps all have space.
        let allSteps = numSteps + labelValues.length;
        // calculate the ideal distance between ticks to perfectly
        // match the user preference.
        const densitySize = (max - min) / numSteps;
        // create a collection of the distance between all of the
        // existing labels on the slider.
        const diffArr = labelValues.reduce((acc, val, ind, arr) => {
            return ind < labelValues.length - 1
                ? [...acc, arr[ind + 1] - val]
                : acc;
        }, []);
        // track the label index.
        let currLableInd = 0;
        // get the iterator for the values
        let diffIterator = diffArr[Symbol.iterator]();
        // format the configuration needed by the sub-tick function
        let intervalConfig = {
            prevValue: labelValues[currLableInd],
            diff: diffIterator.next(),
            direction,
            densitySize
        };
        // as long as there are still fewer total ticks on the slider
        // than preferred ticks as calculated using density and there
        // are still intervals into which we can place subticks, then
        // keep adding subticks.
        do {
            if (intervalConfig.diff.value > densitySize * 1.5) {
                allSteps -= addSubInterval(tickObj, intervalConfig);
            }
            allSteps--;
            currLableInd++;
            intervalConfig.prevValue = labelValues[currLableInd];
            intervalConfig.diff = diffIterator.next();
        } while (allSteps > 0 && !intervalConfig.diff.done);
    }
};
