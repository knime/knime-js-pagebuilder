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
 *  obj.thousands = the string delimiter for thousands
 *                  ex: obj.thousands = '&';
 *                      num = 1000; => '1&000'
 *  obj.mark = the string delimiter between the integer
 *             and the decimal
 *             ex: obj.mark = '_';
 *                 num = 1.234; => '1_234'
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
 *                 ex: obj.negative = '+';
 *                     num = -1; => '+1'
 * 
 * @param  {} num the number to be formatted
 * @param  {} obj the label configuration object
 * @returns {} string representation of input number
 */
export const format = (num, obj) => {
    let label = obj.decimals
        ? num.toFixed(obj.decimals)
        : num;
    label = label.toString();
    if (obj.mark) { label = label.replace('.', obj.mark); }
    if ((num >= 1000 || num <= -1000) &&
        obj.thousand) {
        let thouStr = label.split(obj.mark || '.');
        let newStr = thouStr[0][0];
        for (let i = 1; i < thouStr[0].length; i++) {
            newStr += ((thouStr[0].length - i) % 3 === 0
                ? obj.thousand
                : '') + thouStr[0][i];
        }
        if (thouStr.length === 2) {
            newStr += (obj.mark || '.') + thouStr[1];
        }
        label = newStr;
    }
    let pref = obj.prefix || '';
    if (num < 0) {
        pref += obj.negativeBefore || '';
        if (obj.negative) {
            label = label.toString().replace('-', obj.negative);
        }
    }
    label = pref + label;
    label += obj.postfix || '';
    return label;
};
