export const invoke = function (pckg, mdl, method, params) {
    return new Promise((resolve, reject) => {
        cordova.exec(
            (res) => {
                resolve(res.result);
            }, (err) => {
                reject(err);
            },
            'HybroCordovaPlugin',
            'invoke',
            [pckg, mdl, method, params],
        );
    });
};
