import fs from 'fs';

describe('load error handler', () => {
    let loadErrorHandlerSrc;

    beforeAll(() => {
        const instrumenter = require('istanbul-lib-instrument').createInstrumenter();
        const filename = require.resolve('@/components/layout/injectedScripts/loadErrorHandler');
        // trick taken from https://jasonstitt.com/istanbul-cover-eval to allow coverage in evaluated src
        loadErrorHandlerSrc = instrumenter.instrumentSync(fs.readFileSync(filename, 'utf-8'), filename);

        jest.spyOn(window, 'postMessage').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.resetAllMocks();
        delete window.onerror;
    });

    it('defines the onerror function', () => {
        eval(loadErrorHandlerSrc);
        expect(typeof window.onerror).toBe('function');
    });

    it('handles only load timout errors', () => {
        expect(window.postMessage).not.toHaveBeenCalled();
        eval(loadErrorHandlerSrc);

        try {
            throw new Error('Random error');
        } catch (err) {
            window.onerror(err);
        }
        expect(window.postMessage).not.toHaveBeenCalled();

        try {
            throw new Error('load timeout');
        } catch (err) {
            window.onerror(err);
        }
        expect(window.postMessage).toHaveBeenCalledWith({
            isValid: false,
            nodeId: '%NODEID%',
            error: 'Required web resources timed out and could not be loaded.',
            type: 'error'
        }, undefined); // eslint-disable-line no-undefined
    });
});
