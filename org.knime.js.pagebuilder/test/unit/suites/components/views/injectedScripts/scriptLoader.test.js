import { expect, describe, beforeAll, beforeEach, afterAll, it, vi } from 'vitest';
import fs from 'fs';

describe('script loader', () => {
    let knimeLoaderSrc;

    beforeAll(() => {
        const instrumenter = require('istanbul-lib-instrument').createInstrumenter();
        const filename = require.resolve('@/components/views/injectedScripts/scriptLoader');
        // trick taken from https://jasonstitt.com/istanbul-cover-eval to allow coverage in evaluated src
        knimeLoaderSrc = instrumenter.instrumentSync(fs.readFileSync(filename, 'utf-8'), filename);

        vi.spyOn(window, 'postMessage').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetAllMocks();
        delete window.knimeLoader;
    });

    it('defines the global knimeLoader function', () => {
        eval(knimeLoaderSrc);
        expect(typeof window.knimeLoader).toBe('function');
    });

    it('handles success', () => {
        expect(window.postMessage).not.toHaveBeenCalled();
        eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 2));

        window.knimeLoader(true);
        window['%NAMESPACE%'] = { fakeView: true };
        window.knimeLoader(true);

        expect(window.postMessage).toHaveBeenCalledWith({ nodeId: '%NODEID%', type: 'load' }, '%ORIGIN%');
        delete window['%NAMESPACE%'];
    });

    it('handles load errors', () => {
        const message = 'Script could not be loaded';
        eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 100));

        window.knimeLoader(true);
        expect(() => window.knimeLoader(false)).toThrowError(new Error(message));

        expect(window.postMessage).toHaveBeenCalledWith({
            nodeId: '%NODEID%',
            error: message,
            type: 'load'
        }, '%ORIGIN%');
    });

    it('handles successful load with missing view', () => {
        const message = 'No view found under namespace %NAMESPACE%';
        eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 2));

        window.knimeLoader(true);
        expect(() => window.knimeLoader(true))
            .toThrowError(new ReferenceError(message));

        expect(window.postMessage).toHaveBeenCalledWith({
            nodeId: '%NODEID%',
            error: message,
            type: 'load'
        }, '%ORIGIN%');
    });

    it('handles empty script list', () => {
        expect(window.postMessage).not.toHaveBeenCalled();
        eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 0));

        expect(window.postMessage).toHaveBeenCalledWith({ nodeId: '%NODEID%', type: 'load' }, '%ORIGIN%');
    });
});
