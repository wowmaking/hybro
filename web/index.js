import RNMsgChannel from 'react-native-webview-messaging';
import uuid from 'uuid/v1';


import { stringify, parse, } from '../common/json';
import * as TYPES from '../common/types';


const promises = {};
const results = {};
const callbacks = {};


export const invoke = function (pckg, mdl, method, params) {
    return new Promise((resolve, reject) => {
        let id = uuid();
        promises[id] = { resolve, reject, };
        RNMsgChannel.sendJSON({
            type: TYPES.INVOKE,
            id,
            args: stringify([pckg, mdl, method, params]),
        });
    });
};

export const addEventListener = function (pckg, mdl, evnt, cb) {
    return new Promise((resolve, reject) => {
        let id = uuid();
        promises[id] = { resolve, reject, };
        callbacks[id] = cb;
        RNMsgChannel.sendJSON({
            type: TYPES.ADD_EVENT_LISTENER,
            id,
            args: stringify([pckg, mdl, evnt]),
        });
    });
}

export const removeEventListener = function (pckg, mdl, evnt, cbId) {
    return new Promise((resolve, reject) => {
        let id = uuid();
        promises[id] = { resolve, reject, };
        delete callbacks[cbId];
        RNMsgChannel.sendJSON({
            type: TYPES.REMOVE_EVENT_LISTENER,
            id,
            args: stringify([pckg, mdl, evnt, cbId]),
        });
    });
}



RNMsgChannel.on('json', payload => {
    if (payload && payload.id) {
        results[payload.id] = results[payload.id] || {
            result: {},
            parts: 0,
        };

        results[payload.id].result[payload.index] = payload.result;
        results[payload.id].parts++;

        if (results[payload.id].parts == payload.parts) {
            let r = '';
            for (let i = 0; i < payload.parts; ++i) {
                r += results[payload.id].result[i];
            }

            r = parse(r);

            if (payload.type == TYPES.EVENT) {
                let cb = callbacks[payload.commandId];
                if (cb) {
                    cb(r);
                }
            }
            else if (promises[payload.commandId]) {
                if (payload.type == TYPES.ERROR) {
                    promises[payload.commandId].reject(new Error(r.message));
                }
                else {
                    promises[payload.commandId].resolve(r);

                }
                delete promises[payload.commandId];
            }
            else {
                console.warn('Promise is already resolved or rejected');
            }
        }
    }
});



// https://github.com/facebook/react-native/issues/11594#issuecomment-298850709
// TODO
function awaitPostMessage() {
    var isReactNativePostMessageReady = !!window.originalPostMessage;
    var queue = [];
    var currentPostMessageFn = function store(message) {
        if (queue.length > 100) queue.shift();
        queue.push(message);
    };
    if (!isReactNativePostMessageReady) {
        var originalPostMessage = window.postMessage;
        Object.defineProperty(window, 'postMessage', {
            configurable: true,
            enumerable: true,
            get: function () {
                return currentPostMessageFn;
            },
            set: function (fn) {
                currentPostMessageFn = fn;
                isReactNativePostMessageReady = true;
                setTimeout(sendQueue, 0);
            }
        });
        window.postMessage.toString = function () {
            return String(originalPostMessage);
        };
    }

    function sendQueue() {
        while (queue.length > 0) window.postMessage(queue.shift());
    }
}

awaitPostMessage();
