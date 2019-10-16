/**
 * Utility function to retrieve the value of a property when passed
 * a string representation of it's key.
 *
 * ex:
 *      obj = {
 *          a : {
 *              b: {
 *                  c: 1
 *              }
 *          }
 *      };
 *      key = 'a.b.c';
 *
 *      getProp(obj, key);   // 1
 *
 * This is useful when using the kind of deep accessors/properties
 * often found in the knime nodeConfig objects.
 *
 * @param  {} obj the object with the deep/nested property
 * @param  {} key the string key with '.' delimited properties
 * @returns null
 */
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

/**
 * Utility function to set the value of a property when passed
 * a string representation of it's key and the new value.
 *
 * ex:
 *      obj = {
 *          a : {
 *              b: {
 *                  c: 1
 *              }
 *          }
 *      };
 *      key = 'a.b.c';
 *      val = 2;
 *
 *      getProp(obj, key);          // 1
 *      setProp(obj, key, val);     // null
 *      getProp(obj, key);          // 2
 *
 * This is useful when using the kind of deep accessors/properties
 * often found in the knime nodeConfig objects.
 *
 * @param  {} obj the object with the deep/nested property
 * @param  {} key the string key with '.' delimited properties
 * @param  {} val the value to set as the new value
 * @returns null
 * @throws error if the provided key does not exist in the obj
 */
export const setProp = (obj, key, val) => {
    if (typeof key === 'string') {
        key = key.split('.');
    }
    if (key.length > 1) {
        let newKey = key.shift();
        obj[newKey] = typeof obj[newKey] === 'object' ? obj[newKey] : {};
        setProp(obj[newKey], key, val);
    } else {
        if (!obj[key[0]]) throw Error('Provided key does not exist!');
        obj[key[0]] = val;
    }
};
