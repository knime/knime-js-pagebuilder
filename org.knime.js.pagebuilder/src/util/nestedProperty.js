export const getProp = (obj, key) => {
    if (typeof key === 'string') {
        key = key.split('.');
    }
    if (key.length > 1) {
        let newKey = key.shift();
        return typeof obj[newKey] === 'undefined' ? null : getProp(obj[newKey], key);
    } else {
        return obj[key[0]];
    }
};

export const setProp = (obj, key, val) => {
    if (typeof key === 'string') {
        key = key.split('.');
    }
    if (key.length > 1) {
        let newKey = key.shift();
        obj[newKey] = typeof obj[newKey] === 'object' ? obj[newKey] : {};
        setProp(obj[newKey], key, val);
    } else {
        obj[key[0]] = val;
    }
};
