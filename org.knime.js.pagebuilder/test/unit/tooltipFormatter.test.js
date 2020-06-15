/* eslint-disable no-magic-numbers */
import formatTooltip from '../../src/util/tooltipFormatter';

describe('numStrFormatter.js', () => {

    it('handles numbers', () => {
        const configObj = {};
        const intTest = 10;
        const dblTest = .01;
        const negTest = -10;


        expect(formatTooltip(intTest, configObj)).toEqual('10');
        expect(formatTooltip(dblTest, configObj)).toEqual('0.01');
        expect(formatTooltip(negTest, configObj)).toEqual('-10');
    });

    it('rounds to provided decimal point', () => {
        let configObj = {};
        const testValue = 1.23456789;

        expect(formatTooltip(testValue, configObj)).toEqual('1.23456789');
        configObj.decimals = 0;
        expect(formatTooltip(testValue, configObj)).toEqual('1.23456789');
        configObj.decimals = 4;
        expect(formatTooltip(testValue, configObj)).toEqual('1.2346');
    });

    it('delimits thousands properly', () => {
        let configObj = {};
        const testValue1 = 123456789;

        expect(formatTooltip(testValue1, configObj)).toEqual('123456789');
        configObj.thousand = ',';
        expect(formatTooltip(testValue1, configObj)).toEqual('123,456,789');
        configObj.thousand = '.';
        expect(formatTooltip(testValue1, configObj)).toEqual('123.456.789');
        const testValue2 = '1234.56789';
        expect(formatTooltip(testValue2, configObj)).toEqual('1.234.56789');
    });

    it('uses provided mark', () => {
        let configObj = {
            mark: '$'
        };
        const testValue = 1234.56789;

        expect(formatTooltip(testValue, configObj)).toEqual('1234$56789');
    });

    it('uses provided prefix', () => {
        let configObj = {
            prefix: '$'
        };
        const testValue = 123456789;

        expect(formatTooltip(testValue, configObj)).toEqual('$123456789');
    });

    it('uses provided postfix', () => {
        let configObj = {
            postfix: '%'
        };
        const testValue = 123456789;

        expect(formatTooltip(testValue, configObj)).toEqual('123456789%');
    });

    it('uses provided negativeBefore', () => {
        let configObj = {
            negativeBefore: '+/'
        };
        const testValue = -123456789;

        expect(formatTooltip(testValue, configObj)).toEqual('+/-123456789');
    });

    it('uses provided negative replacement', () => {
        let configObj = {
            negative: '?'
        };
        const testValue = -123456789;

        expect(formatTooltip(testValue, configObj)).toEqual('?123456789');
    });
});
