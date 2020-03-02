import fs from 'fs';

describe('view alert handler', () => {
    let viewAlertHandlerSrc;

    beforeAll(() => {
        const instrumenter = require('istanbul-lib-instrument').createInstrumenter();
        const filename = require.resolve('@/components/layout/injectedScripts/viewAlertHandler');
        // trick taken from https://jasonstitt.com/istanbul-cover-eval to allow coverage in evaluated src
        viewAlertHandlerSrc = instrumenter.instrumentSync(fs.readFileSync(filename, 'utf-8'), filename);

        jest.spyOn(window, 'postMessage').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.resetAllMocks();
        delete window.alert;
    });

    it('defines the window.alert function', () => {
        expect(typeof window.alert).toBe('function');
        delete window.alert;
        expect(typeof window.alert).toBe('undefined');
        eval(viewAlertHandlerSrc);
        expect(typeof window.alert).toBe('function');
    });

    it('handles in view error alerts', () => {
        expect(window.postMessage).not.toHaveBeenCalled();
        eval(viewAlertHandlerSrc);

        let message = 'Error: undefined';

        window.alert(message);

        expect(window.postMessage).toHaveBeenCalledWith({
            nodeId: '%NODEID%',
            message,
            type: 'alert',
            level: 'error'
        }, undefined); // eslint-disable-line no-undefined
    });

    it('handles in view warnings and info alerts', () => {
        expect(window.postMessage).not.toHaveBeenCalled();
        eval(viewAlertHandlerSrc);

        let message = 'Some non-critical message.';

        window.alert(message);

        expect(window.postMessage).toHaveBeenCalledWith({
            nodeId: '%NODEID%',
            message,
            type: 'alert',
            level: 'info'
        }, undefined); // eslint-disable-line no-undefined
    });
});
