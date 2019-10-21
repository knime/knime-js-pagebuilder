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

const getTickSize = (ind, numTick) => {
    switch (true) {
    case  ind === 0:
    case  ind === numTick:
    case  numTick % 2 !== 0:
        return 4;
    case  Math.ceil(numTick / 2) === ind:
        return 8;
    case  ind % 2 === 0:
        return 6;
    default:
        return 5;
    }
};

const addSubInterval = (tickObj, intervalConfig) => {
    const { prevValue, diff, direction, densitySize } = intervalConfig;
    let subSteps = Math.floor(diff.value / densitySize);
    let stepSize = diff.value / subSteps;
    for (let i = 1; i < subSteps; i++) {
        let val = prevValue + stepSize * i;
        let tickSize = getTickSize(i, subSteps);
        if (typeof tickObj[val] === 'undefined') {
            tickObj[val] = newTick(tickSize, direction);
        }
    }
    return subSteps;
};

export const createSubTicks = (tickObj, vals, subTickConfig) => {
    const { min, max, direction, density } = subTickConfig;
    if (density) {
        if (!tickObj[min]) {
            tickObj[min] = newTick(11, direction);
        }
        if (!tickObj[max]) {
            tickObj[max] = newTick(11, direction);
        }
        const labelValues = Array.from(vals);
        const rangeDiff = max - min;
        let numSteps = 100 / density;
        let allSteps = numSteps + labelValues.length;
        const densitySize = rangeDiff / numSteps;
        if (labelValues.length && labelValues.length > 2) {
            // eslint-disable-next-line arrow-body-style
            const diffArr = labelValues.reduce((acc, val, ind, arr) => {
                return ind < labelValues.length - 1
                    ? [...acc, arr[ind + 1] - val]
                    : acc;
            }, []);
            let currLableInd = 0;
            let diffIterator = diffArr[Symbol.iterator]();
            let intervalConfig = {
                prevValue: labelValues[currLableInd],
                diff: diffIterator.next(),
                direction,
                densitySize
            };
            do {
                if (intervalConfig.diff.value > densitySize * 1.5) { // maybe 1
                    allSteps -= addSubInterval(tickObj, intervalConfig);
                }
                allSteps--;
                currLableInd++;
                intervalConfig.prevValue = labelValues[currLableInd];
                intervalConfig.diff = diffIterator.next();
            } while (allSteps > 0 && !intervalConfig.diff.done);
        } else {
            tickObj[min] = newTick(10, direction);
            for (let i = 1; i < numSteps; i++) {
                let val = min + densitySize * i;
                tickObj[val] = newTick(5, direction);
            }
            tickObj[max] = newTick(10, direction);
        }
    }
};
