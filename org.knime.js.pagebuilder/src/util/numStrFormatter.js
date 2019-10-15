export const format = (num, obj) => {
    let label = obj.decimals
        ? num.toFixed(obj.decimals)
        : num;
    label = label.toString();
    if (num >= 1000 || num <= -1000) {
        let thouStr = label.split('.');
        let newStr = '';
        for (let i = 0; i < thouStr[0].length; i++) {
            newStr += i % 3 === 0
                ? obj.thousand || ''
                : thouStr[0][i - 1];
        }
        if (thouStr.length === 2) {
            newStr += (obj.mark || '.') + thouStr[1];
        }
        label = newStr;
    }
    if (obj.mark) { label = label.replace('.', obj.mark); }
    let pref = obj.prefix || '';
    if (obj.negative && num < 0) {
        pref += obj.negativeBefore || '';
        label = label.toString().replace('-', obj.negative);
    }
    label = pref + label;
    label += obj.postfix || '';
    return label;
};
