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
            parent.postMessage(resp, origin);
        };

        if (loadingErrRegExp.test(msg)) {
            postErrorResponse('Required web resources timed out and could not be loaded.');
        }
    };
})();
