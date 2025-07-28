// @ts-expect-error
import tzParseTimezone from "@date-fns-tz/_lib/tzParseTimezone";
// @ts-expect-error
import tzPattern from "@date-fns-tz/_lib/tzPattern";
import { type OptionsWithTZ, toDate } from "date-fns-tz";
/**
 * This method is used to circumvent the following open issue in date-fns-tz
 * https://github.com/marnusw/date-fns-tz/issues/302
 *
 * The problem is that the zonedTimeToUtc returns a Date object so that
 *  when e.g. getHours is called, the respective UTC time hours are returned.
 * But since getHours depends on the systems timezone,
 * the actual underlying UTC time is shifted accordingly.
 *
 *
 * The code is an adapted version of date-fns-tz 3.2.0
 * https://www.npmjs.com/package/date-fns-tz?activeTab=code
 * /date-fns-tz/dist/cjs/fromZonedTime/index.js
 */
export const fromZonedTime = (
  date: string | Date,
  timeZone: string,
  options?: OptionsWithTZ,
) => {
  // Same code
  if (typeof date === "string" && !date.match(tzPattern)) {
    return toDate(
      date,
      Object.assign(Object.assign({}, options), { timeZone }),
    );
  }
  date = toDate(date, options);
  /**
   * Here we differ. Original code: 
    const utc = newDateUTC(date.getFullYear(), date.getMonth(), date.getDate(),
         date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
         .getTime();
    const offsetMilliseconds = tzParseTimezone(timeZone, new Date(utc));
    return new Date(utc + offsetMilliseconds);
   */
  const offsetMilliseconds = tzParseTimezone(timeZone, date);
  return new Date(date.getTime() + offsetMilliseconds);
};

/**
 * Similarly to fromTimeZone, we need this method to replace the utcToZonedTime method,
 *  since this method is the inverse of the (incorrect) zonedTimeToUtc method.
 *
 * The code is an adapted version of date-fns-tz 3.2.0
 * https://www.npmjs.com/package/date-fns-tz?activeTab=code
 * /date-fns-tz/dist/cjs/toZonedTime/index.js
 */
export const toZonedTime = (
  date: string | Date,
  timeZone: string,
  options?: OptionsWithTZ,
) => {
  date = toDate(date, options);
  const offsetMilliseconds = tzParseTimezone(timeZone, date, true);
  return new Date(date.getTime() - offsetMilliseconds);
  /** 
   * The original code does not return here but instead assigns what is returned here
   *  to a variable d and transforms it further like this:
    const resultDate = new Date(0);
    resultDate.setFullYear(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    resultDate.setHours(d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
    return resultDate; 
   */
};
