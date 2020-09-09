window.alert = (function () {
    var origin = '%ORIGIN%';
    var nodeId = '%NODEID%';
    return function (msg) {
        var loadingErrRegExp = new this.RegExp(/error/gmi);
        var postResponse = function (message, level) {
            var resp = {
                nodeId: nodeId,
                type: 'alert',
                message: message,
                level: level
            };
            parent.postMessage(resp, origin);
        };

        if (loadingErrRegExp.test(msg)) {
            postResponse(msg, 'error');
        } else {
            postResponse(msg, 'info');
        }
    };
})();
