describe('message listener', () => {

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

    it('handles the "init" message', () => {
        let data = {
            type: 'init',
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

    it('ignores irrelevant messages', () => {
        let data = {
            type: 'init',
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
