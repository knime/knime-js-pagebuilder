import consola from 'consola';
window.consola = consola;

import { vi } from 'vitest';

vi.mock('raw-loader!./injectedScripts/messageListener.js', () => '"messageListener.js mock";', { virtual: true });
vi.mock('raw-loader!./injectedScripts/scriptLoader.js', () => '"scriptLoader.js mock";', { virtual: true });
vi.mock('raw-loader!iframe-resizer/js/iframeResizer.contentWindow.js', () => '"iframeResizer.js mock";',
    { virtual: true });
vi.mock('raw-loader!./injectedScripts/loadErrorHandler.js', () => '"loadErrorHandler.js mock";', { virtual: true });
vi.mock('raw-loader!./injectedScripts/viewAlertHandler.js', () => '"viewAlertHandler.js mock";', { virtual: true });

// TODO: WEBP-585 remove mock
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
});
