/**
 * updates the date part (year, day and month) of a date object (base)
 * time, offset (timezone) and so on will be left untouched
 *
 * @param {Date} base - date which will be used (copied) to set day, month and year
 * @param {Date} date - extract day, month and year from this date object
 * @returns {Date} copy of base with day, month and year of date
 */
export default (base, date) => {
    let d = new Date(base);
    // ignore falsely dates
    if (date) {
        d.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    }
    return d;
};
