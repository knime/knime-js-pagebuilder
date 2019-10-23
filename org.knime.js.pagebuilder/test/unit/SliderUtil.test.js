import { createTicks } from '../../src/util/widgetUtil/slider/tickUtil';

describe('tickUtil.js', () => {

    it('handles missing config', () => {
        const tickConfig = {
            min: 1,
            max: 100,
            direction: 'ltr'
        };

        expect(createTicks(tickConfig)).toEqual({});
    });

    it('handles empty ticks', () => {
        const tickConfig = {
            config: {
                mode: ''
            },
            min: 1,
            max: 100,
            direction: 'ltr'
        };

        expect(createTicks(tickConfig)).toEqual({});
    });

    it('handles step ticks', () => {
        const tickConfig = {
            config: {
                mode: 'steps',
                format: {
                    negative: '-',
                    decimals: 2,
                    mark: '.'
                },
            },
            min: 0,
            max: 100,
            direction: 'ltr',
            stepSize: 25
        };

        expect(createTicks(tickConfig)).toEqual({
            '0': '0.00',
            '25': '25.00',
            '50': '50.00',
            '75': '75.00',
            '100': '100.00'
        });
    });

    it('handles count ticks', () => {
        const tickConfig = {
            config: {
                mode: 'count',
                format: {
                    negative: '-',
                    decimals: 2,
                    mark: '.'
                },
                values: [4]
            },
            min: 0,
            max: 100,
            direction: 'ltr'
        };

        expect(createTicks(tickConfig)).toEqual({
            '0': '0.00',
            '25': '25.00',
            '50': '50.00',
            '75': '75.00',
            '100': '100.00'
        });
    });

    it('handles values ticks', () => {
        const tickConfig = {
            config: {
                mode: 'values',
                format: {
                    negative: '-',
                    decimals: 2,
                    mark: '.'
                },
                values: [1, 50, 100]
            },
            min: 1,
            max: 100,
            direction: 'ltr'
        };

        expect(createTicks(tickConfig)).toEqual({
            '1': '1.00',
            '50': '50.00',
            '100': '100.00'
        });
    });

    it('handles range ticks', () => {
        const tickConfig = {
            config: {
                mode: 'range',
                format: {
                    negative: '-',
                    decimals: 2,
                    mark: '.'
                }
            },
            min: 1,
            max: 100,
            direction: 'ltr'
        };

        expect(createTicks(tickConfig)).toEqual({
            '1': '1.00',
            '100': '100.00'
        });
    });

    it('handles density only ticks', () => {
        const tickConfig = {
            config: {
                density: 25
            },
            min: 0,
            max: 100,
            direction: 'ltr'
        };

        expect(createTicks(tickConfig)).toEqual({
            '0': {
                label: '',
                labelStyle: {
                    display: 'none'
                },
                style: {
                    height: '11px !important'
                }
            },
            '25': {
                label: '',
                labelStyle: {
                    display: 'none'
                },
                style: {
                    height: '5px !important'
                }
            },
            '50': {
                label: '',
                labelStyle: {
                    display: 'none'
                },
                style: {
                    height: '8px !important'
                }
            },
            '75': {
                label: '',
                labelStyle: {
                    display: 'none'
                },
                style: {
                    height: '5px !important'
                }
            },
            '100': {
                label: '',
                labelStyle: {
                    display: 'none'
                },
                style: {
                    height: '11px !important'
                }
            }
        });
    });

    // it('rounds to provided decimal point', () => {
    //     let configObj = {};
    //     let testValue = 1.23456789;

    //     expect(format(testValue, configObj)).toEqual('1.23456789');
    //     configObj.decimals = 0;
    //     expect(format(testValue, configObj)).toEqual('1.23456789');
    //     configObj.decimals = 4;
    //     expect(format(testValue, configObj)).toEqual('1.2346');
    // });

    // it('delimits thousands properly', () => {
    //     let configObj = {};
    //     let testValue = 123456789;

    //     expect(format(testValue, configObj)).toEqual('123456789');
    //     configObj.thousand = ',';
    //     expect(format(testValue, configObj)).toEqual('123,456,789');
    //     configObj.thousand = '.';
    //     expect(format(testValue, configObj)).toEqual('123.456.789');
    //     testValue = '1234.56789';
    //     expect(format(testValue, configObj)).toEqual('1.234.56789');
    // });

    // it('uses provided mark', () => {
    //     let configObj = {
    //         mark: '$'
    //     };
    //     let testValue = 1234.56789;

    //     expect(format(testValue, configObj)).toEqual('1234$56789');
    // });

    // it('uses provided prefix', () => {
    //     let configObj = {
    //         prefix: '$'
    //     };
    //     let testValue = 123456789;

    //     expect(format(testValue, configObj)).toEqual('$123456789');
    // });

    // it('uses provided postfix', () => {
    //     let configObj = {
    //         postfix: '%'
    //     };
    //     let testValue = 123456789;

    //     expect(format(testValue, configObj)).toEqual('123456789%');
    // });

    // it('uses provided negativeBefore', () => {
    //     let configObj = {
    //         negativeBefore: '+/'
    //     };
    //     let testValue = -123456789;

    //     expect(format(testValue, configObj)).toEqual('+/-123456789');
    // });

    // it('uses provided negative replacement', () => {
    //     let configObj = {
    //         negative: '?'
    //     };
    //     let testValue = -123456789;

    //     expect(format(testValue, configObj)).toEqual('?123456789');
    // });
});
