import uuid from 'uuid/v1';

import * as TYPES from './types';


export class Invoker {

    constructor(packages, sendRequest, sendResult) {
        this.promises = {};
        this.listeners = {};
        this.bridgeListeners = {};

        this.packages = packages;
        this.sendRequest = sendRequest;
        this.sendResult = sendResult;
    }

    invoke(pckg, mdl, method, params) {
        return new Promise((resolve, reject) => {
            let id = uuid();

            this.promises[id] = { resolve, reject, };

            this.sendRequest(id, TYPES.INVOKE, [pckg, mdl, method, params]);
        });
    }

    addEventListener(pckg, mdl, evnt, listener) {
        return new Promise((resolve, reject) => {
            let id = uuid();

            this.promises[id] = { resolve, reject, };
            this.listeners[id] = listener;

            this.sendRequest(id, TYPES.ADD_EVENT_LISTENER, [pckg, mdl, evnt]);
        });
    }

    removeEventListener(pckg, mdl, evnt, listener) {
        return new Promise((resolve, reject) => {
            let id = uuid(),
                cbId;

            for (let i in this.listeners) {
                if (this.listeners[i] === listener) {
                    cbId = i;
                    break;
                }
            }

            this.promises[id] = { resolve, reject, };
            delete this.listeners[cbId];

            this.sendRequest(id, TYPES.REMOVE_EVENT_LISTENER, [pckg, mdl, evnt, cbId]);
        });
    }

    handleRequest(id, type, args) {
        try {
            if (type === TYPES.INVOKE) {
                let [pckg, mdl, method, params] = args;
                params = params || [];

                Promise.all([
                    this.packages[pckg][mdl][method](...params),
                ])
                    .then(([result]) => {
                        this.sendResult(id, TYPES.SUCCESS, result);
                    }, (error) => {
                        this.sendResult(id, TYPES.ERROR, { message: error && error.message || '', });
                    });
            }
            else if (type === TYPES.ADD_EVENT_LISTENER) {
                let [pckg, mdl, eventName] = args;

                let handler = (result) => {
                    this.sendResult(id, TYPES.EVENT, result);
                };

                handler.pckg = pckg;
                handler.mdl = mdl;
                handler.eventName = eventName;

                let result = this.packages[pckg][mdl].addEventListener(eventName, handler);

                this.bridgeListeners[getListenerHash(pckg, mdl, eventName, id)] = handler;

                this.sendResult(id, TYPES.SUCCESS, result);
            }
            else if (type === TYPES.REMOVE_EVENT_LISTENER) {
                let [pckg, mdl, eventName, cbId] = args;

                let h = getListenerHash(pckg, mdl, eventName, cbId);

                let handler = this.bridgeListeners[h];

                let result = this.packages[pckg][mdl].removeEventListener(eventName, handler);

                this.sendResult(id, TYPES.SUCCESS, result);

                delete this.bridgeListeners[h];
            }
        }
        catch (error) {
            this.sendResult(id, TYPES.ERROR, { message: error && error.message || '', });
        }
    }

    handleResult(id, type, result) {
        if (type === TYPES.EVENT) {
            let listener = this.listeners[id];
            if (listener) {
                if (typeof listener === 'function') {
                    listener(result);
                }
                else if (typeof listener === 'object' && typeof listener.handleEvent === 'function') {
                    listener.handleEvent(result);
                }
            }
        }
        else if (this.promises[id]) {
            if (type == TYPES.ERROR) {
                this.promises[id].reject(new Error(result.message));
            }
            else {
                this.promises[id].resolve(result);

            }
            delete this.promises[id];
        }
        else {
            console.warn('Promise is already resolved or rejected');
        }
    }

    destroy() {
        for (let h in this.bridgeListeners) {
            let handler = this.bridgeListeners[h];
            this.packages[handler.pckg][handler.mdl].removeEventListener(handler.eventName, handler);
            delete this.bridgeListeners[h];
        }
    }

}


function getListenerHash(pckg, mdl, eventName, id) {
    return `${pckg}_${mdl}_${eventName}_${id}`;
}
