require('consola');

jest.mock('raw-loader!./injectedScripts/messageListener.js', () => '"messageListener.js mock";', { virtual: true });
jest.mock('raw-loader!./injectedScripts/scriptLoader.js', () => '"scriptLoader.js mock";', { virtual: true });
jest.mock('raw-loader!iframe-resizer/js/iframeResizer.contentWindow.js', () => '"iframeResizer.js mock";',
    { virtual: true });
jest.mock('raw-loader!./injectedScripts/loadErrorHandler.js', () => '"loadErrorHandler.js mock";', { virtual: true });
jest.mock('raw-loader!./injectedScripts/viewAlertHandler.js', () => '"viewAlertHandler.js mock";', { virtual: true });

// TODO: WEBP-585 remove mock
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
    }))
});
