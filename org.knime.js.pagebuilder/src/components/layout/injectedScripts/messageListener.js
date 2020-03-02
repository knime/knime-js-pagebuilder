(function () {
    var messageFromParent = function (event) {
        var data = event.data;
        if (event.origin !== window.origin || !data) {
            return;
        }
        var namespace = data.namespace;
        var nodeId = data.nodeId;
        var postErrorResponse = function (type, errMsg) {
            var resp = {
                isValid: false,
                nodeId: nodeId,
                type: type,
                error: errMsg
            };
            parent.postMessage(resp, window.origin);
        };
        if (data.type === 'init') {
            var initMethodName = data.initMethodName;
            if (window[namespace] && typeof window[namespace][data.initMethodName] === 'function') {
                try {
                    window[namespace][initMethodName](data.viewRepresentation, data.viewValue);
                } catch (err) {
                    postErrorResponse(data.type, 'View initialization failed: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Init method not present in view.');
            }
        } else if (data.type === 'validate') {
            if (window[namespace] && typeof window[namespace][data.validateMethodName] === 'function') {
                try {
                    var valid = window[namespace][data.validateMethodName]();
                    parent.postMessage({
                        isValid: valid,
                        nodeId: nodeId,
                        type: 'validate'
                    }, window.origin);
                } catch (err) {
                    postErrorResponse(data.type, 'View could not be validated: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Validate method not present in view.');
            }
        } else if (data.type === 'getValue') {
            if (window[namespace] && typeof window[namespace][data.getViewValueMethodName] === 'function') {
                try {
                    var value = window[namespace][data.getViewValueMethodName]();
                    parent.postMessage({
                        value: value,
                        nodeId: nodeId,
                        type: 'getValue'
                    }, window.origin);
                } catch (err) {
                    postErrorResponse(data.type, 'Value could not be retrieved from view: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Value method not present in view.');
            }
        } else if (data.type === 'setValidationError') {
            if (window[namespace] && typeof window[namespace][data.setValidationErrorMethodName] === 'function') {
                try {
                    window[namespace][data.setValidationErrorMethodName](data.errorMessage);
                    parent.postMessage({
                        nodeId: nodeId,
                        type: 'setValidationError',
                        message: data.errorMessage
                    }, window.origin);
                } catch (err) {
                    postErrorResponse(data.type, 'View error message could not be set: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Set error message method not present in view.');
            }
        }
    };
    window.addEventListener('message', messageFromParent);
})();
