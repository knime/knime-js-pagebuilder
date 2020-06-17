window.onerror = (function () {
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
            var messageTarget = window.origin;
            if (typeof messageTarget === 'undefined') {
                messageTarget = window.location.origin;
            } else if (messageTarget === 'null') {
                messageTarget = window;
            }
            parent.postMessage(resp, messageTarget);
        };

        if (loadingErrRegExp.test(msg)) {
            postErrorResponse('Required web resources timed out and could not be loaded.');
        }
    };
})();
