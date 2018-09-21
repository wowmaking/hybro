export const addListener = function (pckg, mdl, evnt, cb) {
    return new Promise((resolve, reject) => {
        cordova.exec(
            ({ result, callbackId, isEmit = false, }) => {
                if (isEmit) {
                    if (typeof cb == 'function') cb(result);
                } else {
                    resolve({ result, callbackId, });
                }
            }, (err) => {
                reject(err);
            },
            'HybroCordovaPlugin',
            'addListener',
            [pckg, mdl, evnt],
        );
    });
}

export const removeListener = function (pckg, mdl, evnt, cbId) {
    return new Promise((resolve, reject) => {
        cordova.exec(
            (result) => {
                resolve(result);
            }, (err) => {
                reject(err);
            },
            'HybroCordovaPlugin',
            'removeListener',
            [pckg, mdl, evnt, cbId],
        );
    });
}
