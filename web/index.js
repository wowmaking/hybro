import Channel from './channel';

import { Invoker } from '../common/invoker';
import { stringify, parse, } from '../common/json';
import * as TYPES from '../common/types';


const packages = {};
const dataChains = {};

function sendRequest(id, type, args) {
    Channel.sendMessage({
        id,
        type,
        args: stringify(args),
    });
}

function sendResult(commandId, type, result) {
    Channel.sendMessage({
        commandId,
        type,
        result: stringify(result),
    });
}

const invoker = new Invoker(packages, sendRequest, sendResult);

export const invoke = function (pckg, mdl, method, params) {
    return invoker.invoke(pckg, mdl, method, params);
};

export const addEventListener = function (pckg, mdl, evnt, listener) {
    return invoker.addEventListener(pckg, mdl, evnt, listener);
}

export const removeEventListener = function (pckg, mdl, evnt, listener) {
    return invoker.removeEventListener(pckg, mdl, evnt, listener);
}

export const registerPackage = function (name, pckg) {
    packages[name] = pckg;
};


Channel.on('message', payload => {
    if (payload && payload.id) {
        dataChains[payload.id] = dataChains[payload.id] || {
            data: {},
            parts: 0,
        };

        dataChains[payload.id].data[payload.index] = payload.result || payload.args;
        dataChains[payload.id].parts++;

        if (dataChains[payload.id].parts == payload.parts) {
            let r = '';
            for (let i = 0; i < payload.parts; ++i) {
                r += dataChains[payload.id].data[i];
            }

            r = parse(r);

            const type = payload.type;

            if (type == TYPES.INVOKE || type == TYPES.ADD_EVENT_LISTENER || type == TYPES.REMOVE_EVENT_LISTENER) {
                invoker.handleRequest(payload.id, type, r);
            }
            else {
                invoker.handleResult(payload.commandId, type, r);
            }
        }
    }
});
