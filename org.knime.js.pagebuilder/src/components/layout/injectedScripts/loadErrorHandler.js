window.onerror = (function () {
    var origin = '%ORIGIN%';
    var nodeId = '%NODEID%';
    return function (msg) {
        var loadingErrRegExp = new this.RegExp(/load timeout/gmi);
        var postErrorResponse = function (errMsg) {
            var resp = {
                nodeId: nodeId,
                type: 'error',
                isValid: false,
                error: errMsg
            };
            var postMessageOrigin = origin;
            if (!postMessageOrigin || postMessageOrigin.indexOf('file:') > -1) {
                postMessageOrigin = '*';
            }
            parent.postMessage(resp, postMessageOrigin);
        };

        if (loadingErrRegExp.test(msg)) {
            postErrorResponse('Required web resources timed out and could not be loaded.');
        }
    };
})();
