import { expect, describe, beforeAll, afterEach, it, vi } from 'vitest';
import sleep from 'webapps-common/util/sleep';

import messageListenerSrc from '@/components/views/injectedScripts/messageListener?raw';

describe('message listener', () => {
    const nodeId = '0.0.7';

    const postMessage = (data, origin) => {
        // we can't use
        // window.postMessage(data, window.location.origin);
        // because of https://github.com/jsdom/jsdom/issues/1260
        const event = new window.MessageEvent('message', {
            data,
            origin: origin || '%ORIGIN%'
        });
        window.dispatchEvent(event);
    };

    beforeAll(() => {
        eval(messageListenerSrc);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('handles the "init" message', () => {
        let data = {
            type: 'init',
            nodeId,
            namespace: 'com.example',
            initMethodName: 'initView',
            viewRepresentation: JSON.stringify('rep'),
            viewValue: JSON.stringify('val')
        };

        let spy = vi.fn();
        window['com.example'] = { initView: spy };

        postMessage(data);

        expect(spy).toHaveBeenCalledWith('rep', 'val');
        delete window['com.example'];
    });

    it('handles errors in the "init" method', async () => {
        let data = {
            type: 'init',
            nodeId,
            namespace: 'com.example',
            initMethodName: 'init',
            viewValue: '{}',
            viewRepresentation: '{}'
        };

        let errorSpy = vi.fn(() => {
            throw new Error('test');
        });
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());
        window['com.example'] = { init: errorSpy };

        postMessage(data);

        expect(errorSpy).toHaveBeenCalledWith({}, {});

        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            error: 'View initialization failed: Error: test',
            isValid: false,
            nodeId: '0.0.7',
            type: 'init'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('handles invalid "init" method', async () => {
        let data = {
            type: 'init',
            nodeId,
            namespace: 'com.example',
            initMethodName: 'DNE',
            viewValue: '{}',
            viewRepresentation: '{}'
        };

        let errorSpy = vi.fn();
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = { init: errorSpy };

        postMessage(data);

        expect(errorSpy).not.toHaveBeenCalled();
        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            error: 'Init method not present in view.',
            isValid: false,
            nodeId: '0.0.7',
            type: 'init'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('retrieves a view value', async () => {
        let data = {
            type: 'getValue',
            nodeId,
            namespace: 'com.example',
            getViewValueMethodName: 'value'
        };

        let sampleValue = { integer: 42 };
        let spy = vi.fn().mockReturnValue(sampleValue);
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = { value: spy };

        postMessage(data);

        expect(spy).toHaveBeenCalled();
        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            nodeId: '0.0.7',
            type: 'getValue',
            value: {
                integer: 42
            }
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('handles errors in the "getValue" method', async () => {
        let data = {
            type: 'getValue',
            nodeId,
            namespace: 'com.example',
            getViewValueMethodName: 'value'
        };

        let errorSpy = vi.fn(() => {
            throw new Error();
        });
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = { value: errorSpy };

        postMessage(data);

        expect(errorSpy).toHaveBeenCalled();
        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            error: 'Value could not be retrieved from view: Error',
            isValid: false,
            nodeId: '0.0.7',
            type: 'getValue'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('handles invalid "getValue" method', async () => {
        let data = {
            type: 'getValue',
            nodeId,
            namespace: 'com.example',
            getViewValueMethodName: 'wrongMethodName'
        };

        let errorSpy = vi.fn();
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = { value: errorSpy };

        postMessage(data);

        expect(errorSpy).not.toHaveBeenCalled();
        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            error: 'Value method not present in view.',
            isValid: false,
            nodeId: '0.0.7',
            type: 'getValue'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('handles "validate" method', async () => {
        let data = {
            type: 'validate',
            nodeId,
            namespace: 'com.example',
            validateMethodName: 'validate'
        };

        let spy = vi.fn().mockReturnValue(true);
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = { validate: spy };

        postMessage(data);

        expect(spy).toHaveBeenCalled();
        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            isValid: true,
            nodeId: '0.0.7',
            type: 'validate'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('handles errors in the "validate" method', async () => {
        let data = {
            type: 'validate',
            nodeId,
            namespace: 'com.example',
            validateMethodName: 'validate'
        };

        let errorSpy = vi.fn(() => {
            throw new Error('test');
        });
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = { validate: errorSpy };

        postMessage(data);

        expect(errorSpy).toHaveBeenCalled();

        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            error: 'View could not be validated: Error: test',
            isValid: false,
            nodeId: '0.0.7',
            type: 'validate'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('handles invalid/missing "validate" methods', async () => {
        let data = {
            type: 'validate',
            nodeId,
            namespace: 'com.example',
            validateMethodName: 'validate'
        };

        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = {};

        postMessage(data);

        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            isValid: true,
            nodeId: '0.0.7',
            type: 'validate'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('handles the "setValidationError" message', async () => {
        let data = {
            type: 'setValidationError',
            nodeId,
            namespace: 'com.example',
            setValidationErrorMethodName: 'setValidationError',
            errorMessage: 'test'
        };

        let setValidationErrorMock = vi.fn();
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = { setValidationError: setValidationErrorMock };
        postMessage(data);
        expect(setValidationErrorMock).toHaveBeenCalled();

        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            errorMessage: 'test',
            namespace: 'com.example',
            setValidationErrorMethodName: 'setValidationError',
            nodeId: '0.0.7',
            type: 'setValidationError'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('handles errors in the "setValidationError" method', async () => {
        let data = {
            type: 'setValidationError',
            nodeId,
            namespace: 'com.example',
            setValidationErrorMethodName: 'setValidationError',
            errorMessage: 'test'
        };

        let errorSpy = vi.fn(() => {
            throw new Error('test');
        });
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = { setValidationError: errorSpy };

        postMessage(data);

        expect(errorSpy).toHaveBeenCalledWith('test');
        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            error: 'View error message could not be set: Error: test',
            isValid: false,
            nodeId: '0.0.7',
            type: 'setValidationError'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('handles invalid/missing "setValidationError" method', async () => {
        let data = {
            type: 'setValidationError',
            nodeId,
            namespace: 'com.example',
            setValidationErrorMethodName: 'DNE',
            errorMessage: 'test'
        };

        let errorSpy = vi.fn();
        let messageSpy = vi.spyOn(parent, 'postMessage').mockImplementation(vi.fn());

        window['com.example'] = { setValidationError: errorSpy };

        postMessage(data);

        expect(errorSpy).not.toHaveBeenCalled();
        await sleep(10);
        expect(messageSpy).toHaveBeenCalledWith({
            error: 'View error message could not be set: Method does not exist.',
            isValid: false,
            nodeId: '0.0.7',
            type: 'setValidationError'
        },
        '%ORIGIN%');
        delete window['com.example'];
    });

    it('ignores irrelevant messages', () => {
        let data = {
            type: 'init',
            nodeId,
            namespace: 'com.example',
            initMethodName: 'initView',
            viewRepresentation: JSON.stringify('rep'),
            viewValue: JSON.stringify('val')
        };

        let spy = vi.fn();
        window['com.example'] = { initView: spy };

        postMessage(data, 'example.invalid');

        expect(spy).not.toHaveBeenCalled();
        delete window['com.example'];
    });
});
