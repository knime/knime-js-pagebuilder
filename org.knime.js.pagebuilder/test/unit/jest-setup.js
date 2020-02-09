require('consola');

jest.mock('raw-loader!./injectedScripts/messageListener.js', () => '"messageListener.js mock";', { virtual: true });
jest.mock('raw-loader!./injectedScripts/scriptLoader.js', () => '"scriptLoader.js mock";', { virtual: true });
jest.mock('raw-loader!./injectedScripts/loadErrorHandler.js', () => '"loadErrorHandler.js mock";', { virtual: true });
jest.mock('raw-loader!./injectedScripts/viewAlertHandler.js', () => '"viewAlertHandler.js mock";', { virtual: true });
