import React from 'react';
import { WebView, } from 'react-native-webview';
import uuid from 'uuid/v1';


import { stringify, parse, } from '../common/json';
import * as TYPES from '../common/types';
import { TOKEN, } from '../common/token';


export class HybroView extends React.Component {

    webListeners = {};

    componentWillUnmount() {
        for (let h in this.webListeners) {
            let handler = this.webListeners[h];
            this.props.packages[handler.pckg][handler.mdl].removeEventListener(handler.eventName, handler);
            delete this.webListeners[h];
        }
    }

    handleRef = (webview) => {
        this.webview = webview;
    }

    handleMessage = (event) => {
        const { data } = event.nativeEvent;

        if (data.indexOf(TOKEN) === 0) {
            const command = JSON.parse(data.replace(TOKEN, ''));
            command.args = parse(command.args);

            switch (command.type) {
                case TYPES.INVOKE:
                    this.onInvoke(command);
                    break;
                case TYPES.ADD_EVENT_LISTENER:
                    this.onAddListener(command);
                    break;
                case TYPES.REMOVE_EVENT_LISTENER:
                    this.onRemoveListener(command);
                    break;
            }
        }
    }

    onInvoke = (command) => {
        try {
            let [pckg, mdl, method, params] = command.args;
            params = params || [];

            Promise.all([
                this.props.packages[pckg][mdl][method](...params),
            ])
                .then(([result]) => {
                    this.sendResult(command, TYPES.SUCCESS, result);
                }, (error) => {
                    this.sendResult(command, TYPES.ERROR, { message: error && error.message || '', });
                });
        }
        catch (error) {
            this.sendResult(command, TYPES.ERROR, { message: error && error.message || '', });
        }
    }

    onAddListener = (command) => {
        try {
            let [pckg, mdl, eventName] = command.args;

            let handler = (result) => {
                this.sendResult(command, TYPES.EVENT, result);
            };

            handler.pckg = pckg;
            handler.mdl = mdl;
            handler.eventName = eventName;

            let result = this.props.packages[pckg][mdl].addEventListener(eventName, handler);

            this.webListeners[getListenerHash(pckg, mdl, eventName, command.id)] = handler;

            this.sendResult(command, TYPES.SUCCESS, result);
        }
        catch (error) {
            this.sendResult(command, TYPES.ERROR, { message: error && error.message || '', });
        }
    }

    onRemoveListener = (command) => {
        try {
            let [pckg, mdl, eventName, cbId] = command.args;

            let h = getListenerHash(pckg, mdl, eventName, cbId);

            let handler = this.webListeners[h];

            let result = this.props.packages[pckg][mdl].removeEventListener(eventName, handler);

            this.sendResult(command, TYPES.SUCCESS, result);

            delete this.webListeners[h];
        }
        catch (error) {
            this.sendResult(command, TYPES.ERROR, { message: error && error.message || '', });
        }
    }

    sendResult = (command, type, result) => {
        result = stringify(result);

        let id = uuid(),
            index = 0,
            size = 100000,
            parts = Math.ceil(result.length / size);

        while (result) {
            this.sendMessage({
                type,
                id,
                commandId: command.id,
                result: result.substr(0, size),
                parts,
                index,
            });
            result = result.substr(size);
            ++index;
        }
    }

    sendMessage(json) {
        if (this.webview) {
            this.webview.injectJavaScript(`window.HybroChannel.emit('message', ${JSON.stringify(json)});`);
        }
        else {
            console.warn('Hybro: no webview');
        }
    }

    render() {
        let { packages, ...others } = this.props;

        return (
            <WebView
                {...others}
                ref={this.handleRef}
                onMessage={this.handleMessage}
            />
        );
    }

}


function getListenerHash(pckg, mdl, eventName, id) {
    return `${pckg}_${mdl}_${eventName}_${id}`;
}
