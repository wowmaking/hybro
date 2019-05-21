import uuid from 'uuid/v1';

import Channel from './channel';

import { stringify, parse, } from '../common/json';
import * as TYPES from '../common/types';


const promises = {};
const results = {};
const listeners = {};


export const invoke = function (pckg, mdl, method, params) {
    return new Promise((resolve, reject) => {
        let id = uuid();

        promises[id] = { resolve, reject, };

        Channel.sendMessage({
            type: TYPES.INVOKE,
            id,
            args: stringify([pckg, mdl, method, params]),
        });
    });
};

export const addEventListener = function (pckg, mdl, evnt, listener) {
    return new Promise((resolve, reject) => {
        let id = uuid();

        promises[id] = { resolve, reject, };
        listeners[id] = listener;

        Channel.sendMessage({
            type: TYPES.ADD_EVENT_LISTENER,
            id,
            args: stringify([pckg, mdl, evnt]),
        });
    });
}

export const removeEventListener = function (pckg, mdl, evnt, listener) {
    return new Promise((resolve, reject) => {
        let id = uuid(),
            cbId;

        for (let i in listeners) {
            if (listeners[i] === listener) {
                cbId = i;
                break;
            }
        }

        promises[id] = { resolve, reject, };
        delete listeners[cbId];

        Channel.sendMessage({
            type: TYPES.REMOVE_EVENT_LISTENER,
            id,
            args: stringify([pckg, mdl, evnt, cbId]),
        });
    });
}



Channel.on('message', payload => {
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
                let listener = listeners[payload.commandId];
                if (listener) {
                    if (typeof listener === 'function') {
                        listener(r);
                    }
                    else if (typeof listener === 'object' && typeof listener.handleEvent === 'function') {
                        listener.handleEvent(r);
                    }
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
