/* eslint-disable complexity */
(function () {
    var messageFromParent = function (event) {
        var data = event.data;
        var postOrigin = window.origin || window.location.origin;
        if (event.origin !== postOrigin || !data) {
            return;
        }
        if (postOrigin === 'null') {
            postOrigin = window;
        }
        var namespace = data.namespace;
        var nodeId = data.nodeId;
        var postMessageResponse = function (resp) {
            resp.nodeId = nodeId;
            parent.postMessage(resp, postOrigin);
        };
        var postErrorResponse = function (type, errMsg) {
            var resp = {
                isValid: false,
                nodeId: nodeId,
                type: type,
                error: errMsg
            };
            parent.postMessage(resp, postOrigin);
        };
        if (data.type === 'init') {
            if (window[namespace] && typeof window[namespace][data.initMethodName] === 'function') {
                try {
                    window[namespace][data.initMethodName](data.viewRepresentation, data.viewValue);
                } catch (err) {
                    postErrorResponse(data.type, 'View initialization failed: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Init method not present in view.');
            }
        } else if (data.type === 'validate') {
            var validResp = {
                isValid: true,
                type: 'validate'
            };
            // optional method; some views don't have (i.e. some quickforms)
            if (window[namespace] && typeof window[namespace][data.validateMethodName] === 'function') {
                try {
                    validResp.isValid = window[namespace][data.validateMethodName]();
                    postMessageResponse(validResp);
                } catch (err) {
                    postErrorResponse(data.type, 'View could not be validated: ' + err);
                }
            } else {
                postMessageResponse(validResp);
            }
        } else if (data.type === 'getValue') {
            if (window[namespace] && typeof window[namespace][data.getViewValueMethodName] === 'function') {
                try {
                    postMessageResponse({
                        value: window[namespace][data.getViewValueMethodName](),
                        type: 'getValue'
                    });
                } catch (err) {
                    postErrorResponse(data.type, 'Value could not be retrieved from view: ' + err);
                }
            } else {
                postErrorResponse(data.type, 'Value method not present in view.');
            }
        } else if (data.type === 'setValidationError') {
            var errorMessagePrefix = 'View error message could not be set: ';
            // optional method; some views don't have (i.e. some quickforms)
            if (window[namespace] && typeof window[namespace][data.setValidationErrorMethodName] === 'function') {
                try {
                    window[namespace][data.setValidationErrorMethodName](data.errorMessage);
                    postMessageResponse(data);
                } catch (err) {
                    postErrorResponse(data.type, errorMessagePrefix + err);
                }
            } else {
                postErrorResponse(data.type, errorMessagePrefix + 'Method does not exist.');
            }
        }
    };
    window.addEventListener('message', messageFromParent);
})();
