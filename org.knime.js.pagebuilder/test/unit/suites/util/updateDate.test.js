/* eslint-disable no-magic-numbers */
import updateDate from '@/util/updateDate';

describe('updateDate.js', () => {
    it('updates only date part (year, month, day) of a date object', () => {
        const d = new Date('2020-10-20T15:12:08');
        const r = updateDate(d, new Date('2019-09-02T12:20:10'));

        expect(r.getFullYear()).toBe(2019);
        expect(r.getMonth()).toBe(8); // month starts with 0
        expect(r.getDate()).toBe(2);
        expect(r.getHours()).toBe(15);
        expect(r.getMinutes()).toBe(12);
        expect(r.getSeconds()).toBe(8);
    });

    it('skips falsy dates', () => {
        const d = new Date();
        expect(updateDate(d, null)).toStrictEqual(d);
    });
});
