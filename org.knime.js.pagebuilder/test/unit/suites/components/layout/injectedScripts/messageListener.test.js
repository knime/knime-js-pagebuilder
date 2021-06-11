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
        event.initEvent('message', false, false);
        window.dispatchEvent(event);
    };

    beforeAll(() => {
        require('@/components/layout/injectedScripts/messageListener');
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

        postMessage(data);

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

        let errorSpy = jest.fn(() => { throw new Error('test'); });
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());
        window['com.example'] = { init: errorSpy };

        postMessage(data);

        expect(errorSpy).toHaveBeenCalledWith({}, {});
        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                error: 'View initialization failed: Error: test',
                isValid: false,
                nodeId: '0.0.7',
                type: 'init'
            },
            '%ORIGIN%');
            delete window['com.example'];
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

        let errorSpy = jest.fn();
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = { init: errorSpy };

        postMessage(data);

        expect(errorSpy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                error: 'Init method not present in view.',
                isValid: false,
                nodeId: '0.0.7',
                type: 'init'
            },
            '%ORIGIN%');
            delete window['com.example'];
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

        let sampleValue = { integer: 42 };
        let spy = jest.fn().mockReturnValue(sampleValue);
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = { value: spy };

        postMessage(data);

        expect(spy).toHaveBeenCalled();
        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                nodeId: '0.0.7',
                type: 'getValue',
                value: {
                    integer: 42
                }
            },
            '%ORIGIN%');
            delete window['com.example'];
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

        let errorSpy = jest.fn(() => { throw new Error(); });
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = { value: errorSpy };

        postMessage(data);

        expect(errorSpy).toHaveBeenCalled();
        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                error: 'Value could not be retrieved from view: Error',
                isValid: false,
                nodeId: '0.0.7',
                type: 'getValue'
            },
            '%ORIGIN%');
            delete window['com.example'];
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

        let errorSpy = jest.fn();
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = { value: errorSpy };

        postMessage(data);

        expect(errorSpy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                error: 'Value method not present in view.',
                isValid: false,
                nodeId: '0.0.7',
                type: 'getValue'
            },
            '%ORIGIN%');
            delete window['com.example'];
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles "validate" method', (done) => {
        let data = {
            type: 'validate',
            nodeId,
            namespace: 'com.example',
            validateMethodName: 'validate'
        };

        let spy = jest.fn().mockReturnValue(true);
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = { validate: spy };

        postMessage(data);

        expect(spy).toHaveBeenCalled();
        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                isValid: true,
                nodeId: '0.0.7',
                type: 'validate'
            },
            '%ORIGIN%');
            delete window['com.example'];
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles errors in the "validate" method', (done) => {
        let data = {
            type: 'validate',
            nodeId,
            namespace: 'com.example',
            validateMethodName: 'validate'
        };

        let errorSpy = jest.fn(() => { throw new Error('test'); });
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = { validate: errorSpy };

        postMessage(data);

        expect(errorSpy).toHaveBeenCalled();
        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                error: 'View could not be validated: Error: test',
                isValid: false,
                nodeId: '0.0.7',
                type: 'validate'
            },
            '%ORIGIN%');
            delete window['com.example'];
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles invalid/missing "validate" methods', (done) => {
        let data = {
            type: 'validate',
            nodeId,
            namespace: 'com.example',
            validateMethodName: 'validate'
        };

        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = {};

        postMessage(data);

        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                isValid: true,
                nodeId: '0.0.7',
                type: 'validate'
            },
            '%ORIGIN%');
            delete window['com.example'];
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles the "setValidationError" message', (done) => {
        let data = {
            type: 'setValidationError',
            nodeId,
            namespace: 'com.example',
            setValidationErrorMethodName: 'setValidationError',
            errorMessage: 'test'
        };

        let setValidationErrorMock = jest.fn();
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = { setValidationError: setValidationErrorMock };
        postMessage(data);
        expect(setValidationErrorMock).toHaveBeenCalled();

        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                errorMessage: 'test',
                namespace: 'com.example',
                setValidationErrorMethodName: 'setValidationError',
                nodeId: '0.0.7',
                type: 'setValidationError'
            },
            '%ORIGIN%');
            delete window['com.example'];
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles errors in the "setValidationError" method', (done) => {
        let data = {
            type: 'setValidationError',
            nodeId,
            namespace: 'com.example',
            setValidationErrorMethodName: 'setValidationError',
            errorMessage: 'test'
        };

        let errorSpy = jest.fn(() => { throw new Error('test'); });
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = { setValidationError: errorSpy };

        postMessage(data);

        expect(errorSpy).toHaveBeenCalledWith('test');
        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                error: 'View error message could not be set: Error: test',
                isValid: false,
                nodeId: '0.0.7',
                type: 'setValidationError'
            },
            '%ORIGIN%');
            delete window['com.example'];
            done();
        }, 10); // eslint-disable-line no-magic-numbers
    });

    it('handles invalid/missing "setValidationError" method', (done) => {
        let data = {
            type: 'setValidationError',
            nodeId,
            namespace: 'com.example',
            setValidationErrorMethodName: 'DNE',
            errorMessage: 'test'
        };

        let errorSpy = jest.fn();
        let messageSpy = jest.spyOn(parent, 'postMessage').mockImplementation(jest.fn());

        window['com.example'] = { setValidationError: errorSpy };

        postMessage(data);

        expect(errorSpy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(messageSpy).toHaveBeenCalledWith({
                error: 'View error message could not be set: Method does not exist.',
                isValid: false,
                nodeId: '0.0.7',
                type: 'setValidationError'
            },
            '%ORIGIN%');
            delete window['com.example'];
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
