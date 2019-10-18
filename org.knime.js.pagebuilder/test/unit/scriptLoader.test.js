import fs from 'fs';

describe('script loader', () => {
    let knimeLoaderSrc;

    beforeAll(() => {
        knimeLoaderSrc = fs.readFileSync(require.resolve('@/components/layout/injectedScripts/scriptLoader'), 'utf-8');
        jest.spyOn(window, 'postMessage').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.resetAllMocks();
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
        eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 100));

        window.knimeLoader(true);
        expect(() => window.knimeLoader(false)).toThrowError(new Error('Script could not be loaded'));

        expect(window.postMessage).toHaveBeenCalledWith({ nodeId: '%NODEID%', type: 'error' }, '%ORIGIN%');
    });

    it('handles successful load with missing view', () => {
        eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 2));

        window.knimeLoader(true);
        expect(() => window.knimeLoader(true))
            .toThrowError(new ReferenceError('no view found under namespace %NAMESPACE%'));

        expect(window.postMessage).toHaveBeenCalledWith({ nodeId: '%NODEID%', type: 'error' }, '%ORIGIN%');
    });

    it('handles empty script list', () => {
        expect(window.postMessage).not.toHaveBeenCalled();
        eval(knimeLoaderSrc.replace("'%LIBCOUNT%'", 0));

        expect(window.postMessage).toHaveBeenCalledWith({ nodeId: '%NODEID%', type: 'load' }, '%ORIGIN%');
    });
});
