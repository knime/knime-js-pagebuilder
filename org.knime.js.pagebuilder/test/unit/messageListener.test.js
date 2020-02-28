describe('message listener', () => {

    const nodeId = '0.0.7';

    const postMessage = (data, origin) => {
        // we can't use
        // window.postMessage(data, window.location.origin);
        // because of https://github.com/jsdom/jsdom/issues/1260
        const event = new window.MessageEvent('message', {
            data,
            origin
        });
        event.initEvent('message', false, false);
        window.dispatchEvent(event);
    };

    beforeAll(() => {
        require('@/components/layout/injectedScripts/messageListener');
        window.origin = window.location.origin;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('handles the "init" message', () => {
        let data = {
            type: 'init',
            nodeId,
            namespace: 'com.example',
            initMethodName: 'initView',
            viewRepresentation: 'rep',
            viewValue: 'val'
        };

        let spy = jest.fn();
        window['com.example'] = { initView: spy };

        postMessage(data, window.origin);

        expect(spy).toHaveBeenCalledWith('rep', 'val');
        delete window['com.example'];
    });

    it('handles errors in the "init" method', (done) => {
        let data = {
            type: 'init',
            nodeId,
            namespace: 'com.example',
            initMethodName: 'init',
            viewValue: {},
            viewRepresentation: {}
        };
        let lastCalledData;

        let errorSpy = jest.fn(() => { throw new Error('test'); });
        let errorListener = jest.fn((event) => {
            lastCalledData = event.data;
        });
        parent.addEventListener('message', errorListener);
        window['com.example'] = { init: errorSpy };

        postMessage(data, window.origin);

        expect(errorSpy).toHaveBeenCalledWith({}, {});
        setTimeout(() => {
            expect(lastCalledData).toBeDefined();
            expect(lastCalledData.type).toBe(data.type);
            expect(lastCalledData.nodeId).toBe(data.nodeId);
            expect(lastCalledData.error).toBe('View initialization failed: Error: test');
            expect(lastCalledData.isValid).toBe(false);
            delete window['com.example'];
            parent.removeEventListener('message', errorListener);
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles invalid "init" method', (done) => {
        let data = {
            type: 'init',
            nodeId,
            namespace: 'com.example',
            initMethodName: 'DNE',
            viewValue: {},
            viewRepresentation: {}
        };
        let lastCalledData;

        let errorSpy = jest.fn();
        let errorListener = jest.fn((event) => {
            lastCalledData = event.data;
        });
        parent.addEventListener('message', errorListener);
        window['com.example'] = { init: errorSpy };

        postMessage(data, window.origin);

        expect(errorSpy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(lastCalledData).toBeDefined();
            expect(lastCalledData.type).toBe(data.type);
            expect(lastCalledData.nodeId).toBe(data.nodeId);
            expect(lastCalledData.error).toBe('Init method not present in view.');
            expect(lastCalledData.isValid).toBe(false);
            delete window['com.example'];
            parent.removeEventListener('message', errorListener);
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('retrieves a view value', (done) => {
        let data = {
            type: 'getValue',
            nodeId,
            namespace: 'com.example',
            getViewValueMethodName: 'value'
        };
        let lastCalledData;

        let sampleValue = { integer: 42 };
        let spy = jest.fn().mockReturnValue(sampleValue);
        let listener = jest.fn((event) => {
            lastCalledData = event.data;
        });
        parent.addEventListener('message', listener);
        window['com.example'] = { value: spy };

        postMessage(data, window.origin);

        expect(spy).toHaveBeenCalled();
        setTimeout(() => {
            expect(lastCalledData).toBeDefined();
            expect(lastCalledData.type).toBe(data.type);
            expect(lastCalledData.nodeId).toBe(data.nodeId);
            expect(lastCalledData.value).toBe(sampleValue);
            expect(lastCalledData.error).not.toBeDefined();
            delete window['com.example'];
            parent.removeEventListener('message', listener);
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles errors in the "getValue" method', (done) => {
        let data = {
            type: 'getValue',
            nodeId,
            namespace: 'com.example',
            getViewValueMethodName: 'value'
        };
        let lastCalledData;

        let errorSpy = jest.fn(() => { throw new Error(); });
        let errorListener = jest.fn((event) => {
            lastCalledData = event.data;
        });
        parent.addEventListener('message', errorListener);
        window['com.example'] = { value: errorSpy };

        postMessage(data, window.origin);

        expect(errorSpy).toHaveBeenCalled();
        setTimeout(() => {
            expect(lastCalledData).toBeDefined();
            expect(lastCalledData.type).toBe(data.type);
            expect(lastCalledData.nodeId).toBe(data.nodeId);
            expect(lastCalledData.error).toBeDefined();
            expect(lastCalledData.value).not.toBeDefined();
            delete window['com.example'];
            parent.removeEventListener('message', errorListener);
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles invalid "getValue" method', (done) => {
        let data = {
            type: 'getValue',
            nodeId,
            namespace: 'com.example',
            getViewValueMethodName: 'wrongMethodName'
        };
        let lastCalledData;

        let errorSpy = jest.fn();
        let errorListener = jest.fn((event) => {
            lastCalledData = event.data;
        });
        parent.addEventListener('message', errorListener);
        window['com.example'] = { value: errorSpy };

        postMessage(data, window.origin);

        expect(errorSpy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(lastCalledData).toBeDefined();
            expect(lastCalledData.type).toBe(data.type);
            expect(lastCalledData.nodeId).toBe(data.nodeId);
            expect(lastCalledData.error).toBeDefined();
            expect(lastCalledData.value).not.toBeDefined();
            delete window['com.example'];
            parent.removeEventListener('message', errorListener);
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles the "setValidationError" message', () => {
        let data = {
            type: 'setValidationError',
            nodeId,
            namespace: 'com.example',
            setValidationErrorMethodName: 'setValidationError',
            errorMessage: 'test'
        };

        let spy = jest.fn();
        window['com.example'] = { setValidationError: spy };

        postMessage(data, window.origin);

        expect(spy).toHaveBeenCalledWith('test');
        delete window['com.example'];
    });

    it('handles errors in the "setValidationError" method', (done) => {
        let data = {
            type: 'setValidationError',
            nodeId,
            namespace: 'com.example',
            setValidationErrorMethodName: 'setValidationError',
            errorMessage: 'test'
        };
        let lastCalledData;

        let errorSpy = jest.fn(() => { throw new Error('test'); });
        let errorListener = jest.fn((event) => {
            lastCalledData = event.data;
        });
        parent.addEventListener('message', errorListener);
        window['com.example'] = { setValidationError: errorSpy };

        postMessage(data, window.origin);

        expect(errorSpy).toHaveBeenCalledWith('test');
        setTimeout(() => {
            expect(lastCalledData).toBeDefined();
            expect(lastCalledData.type).toBe(data.type);
            expect(lastCalledData.nodeId).toBe(data.nodeId);
            expect(lastCalledData.error).toBe('View error message could not be set: Error: test');
            expect(lastCalledData.isValid).toBe(false);
            delete window['com.example'];
            parent.removeEventListener('message', errorListener);
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles invalid "setValidationError" method', (done) => {
        let data = {
            type: 'setValidationError',
            nodeId,
            namespace: 'com.example',
            setValidationErrorMethodName: 'DNE',
            errorMessage: 'test'
        };
        let lastCalledData;

        let errorSpy = jest.fn();
        let errorListener = jest.fn((event) => {
            lastCalledData = event.data;
        });
        parent.addEventListener('message', errorListener);
        window['com.example'] = { setValidationError: errorSpy };

        postMessage(data, window.origin);

        expect(errorSpy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(lastCalledData).toBeDefined();
            expect(lastCalledData.type).toBe(data.type);
            expect(lastCalledData.nodeId).toBe(data.nodeId);
            expect(lastCalledData.error).toBe('Set error message method not present in view.');
            expect(lastCalledData.isValid).toBe(false);
            delete window['com.example'];
            parent.removeEventListener('message', errorListener);
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('ignores irrelevant messages', () => {
        let data = {
            type: 'init',
            nodeId,
            namespace: 'com.example',
            initMethodName: 'initView',
            viewRepresentation: 'rep',
            viewValue: 'val'
        };

        let spy = jest.fn();
        window['com.example'] = { initView: spy };

        postMessage(data, 'example.invalid');

        expect(spy).not.toHaveBeenCalled();
        delete window['com.example'];
    });
});
