import { format } from '../../numStrFormatter';
import { createSubTicks } from './subTickUtil';

export const createTicks = (tickConfig) => {
    const { config, min, max, direction, stepSize } = tickConfig;
    let markConfig = {};
    const orderedValues = new Set([]);
    if (config) {
        switch (config.mode) {
        case 'steps':
        case 'count': {
            markConfig[min] = `${format(min, config.format)}`;
            orderedValues.add(min);
            const step = config.mode === 'steps'
                ? Number(stepSize)
                : (max - min) / config.values[0];
            for (let i = 1; i < (max - min) / step; i++) {
                let val = min + step * i;
                markConfig[val] = `${format(val, config.format)}`;
                orderedValues.add(val);
            }
            markConfig[max] = `${format(max, config.format)}`;
            orderedValues.add(max);
            break;
        }
        case 'values': {
            orderedValues.add(min);
            config.values.forEach((val) => {
                markConfig[val] = `${format(val, config.format)}`;
                orderedValues.add(val);
            });
            orderedValues.add(max);
            break;
        }
        case 'range':
            markConfig[min] = `${format(min, config.format)}`;
            markConfig[max] = `${format(max, config.format)}`;
            orderedValues.add(min);
            orderedValues.add(max);
            break;
        case 'positions': {
            orderedValues.add(min);
            config.values.forEach((val) => {
                let key = max * (val / 100); // || min;
                markConfig[key] = `${format(key, config.format)}`;
                orderedValues.add(key);
            });
            orderedValues.add(max);
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
        createSubTicks(markConfig, orderedValues, subTickConfig);
    }
    return markConfig;
};

