/**
 * updates the time part (hour, minute, second and millisecond) of a date object (base)
 * date, offset (timezone) and so on will be left untouched
 *
 * @param {Date} base - date which will be used (copied) to set day, month and year
 * @param {Date} date - extract hour, minute, second and millisecond from this date object
 * @returns {Date} copy of base with hour, minute, second and millisecond changed
 */
export default (base, date) => {
    let d = new Date(base);
    // ignore falsely dates
    if (date) {
        d.setHours(date.getHours());
        d.setMinutes(date.getMinutes());
        d.setSeconds(date.getSeconds());
        d.setMilliseconds(date.getMilliseconds());
    }
    return d;
};
