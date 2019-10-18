(function () {
    var messageFromParent = function (event) {
        if (event.origin !== window.origin || !event.data) {
            return;
        }
        var data = event.data;
        if (data.type === 'init') {
            var namespace = data.namespace;
            var initMethodName = data.initMethodName;
            var viewRepresentation = data.viewRepresentation;
            var viewValue = data.viewValue;
            window[namespace][initMethodName](viewRepresentation, viewValue);
        }
    };
    window.addEventListener('message', messageFromParent);
})();
