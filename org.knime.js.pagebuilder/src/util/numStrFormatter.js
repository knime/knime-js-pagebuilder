/**
 * This utility function is used for formatting labels
 * in the slider widget. It matches the existing API
 * expected from KNIME AP in the node config.
 *
 * The expected configuration object is as follows:
 *
 *  obj = {};
 *  obj.decimals = number of significant digits
 *                 ex: obj.decimals = 2;
 *                     num = 1.234 => '1.23'
 *  obj.thousand = the string delimiter for thousands
 *                  ex: obj.thousand = '_';
 *                      num = 1000; => '1_000'
 *  obj.mark = the string delimiter between the integer
 *             and the decimal
 *             ex: obj.mark = ',';
 *                 num = 1.234; => '1,234'
 *  obj.prefix = the string prefix for the label
 *               ex: obj.prefix = '$'
 *                   num = 100; => '$100'
 *  obj.negativeBefore = the string that prefixes
 *                       negative numbers before the
 *                       negative sign, but AFTER the
 *                       given prefix. ONLY applies
 *                       to negatives
 *                       ex: obj.negativeBefore = '+/';
 *                           num = -100; => '+/-100'
 *  obj.negative = the string to replace the '-' in
 *                 negative numbers
 *                 ex: obj.negative = '⁒';
 *                     num = -1; => '⁒1'
 *
 * @param  {Number} num the number to be formatted
 * @param  {Object} obj the label configuration object
 * @returns {String} string representation of input number
 */
export const format = (num, obj) => {
    // Significant digit rounding and string conversion
    let label = obj.decimals
        ? num.toFixed(obj.decimals)
        : num.toString();
    // handling thousands formatting
    if (Math.abs(num) >= 1000 && obj.thousand) {
        // separate integer string from decimal string
        let thouStr = label.split('.');
        // let thouStr = label.split(obj.mark || '.');
        let newStr = thouStr[0][0];
        /**
         * counting backwards, rebuild string with correct
         * thousands delimiter (every 3rd digit)
        */
        for (let i = 1; i < thouStr[0].length; i++) {
            newStr += ((thouStr[0].length - i) % 3 === 0
                ? obj.thousand
                : '') + thouStr[0][i];
        }
        // rebuild decimals if needed
        if (thouStr[1]) {
            newStr += (obj.mark || '.') + thouStr[1];
        }
        // update label
        label = newStr;
    } else if (obj.mark) {
        // replacing '.' with obj.mark
        label = label.replace('.', obj.mark);
    }
    // create prefix string
    let pref = obj.prefix || '';
    // format negative numbers
    if (num < 0) {
        // update prefix with negative options
        pref += (obj.negativeBefore || '') +
            (obj.negative || '-');
        // remove the original negative
        label = label.substring(1);
    }
    // add prefix
    label = pref + label;
    // add postfix
    label += obj.postfix || '';
    // return formatted label
    return label;
};
