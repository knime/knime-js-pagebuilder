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
