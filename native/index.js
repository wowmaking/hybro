import React from 'react';
import { WebView, } from 'react-native-webview';
import uuid from 'uuid/v1';


import { Invoker, } from '../common/invoker';
import { stringify, parse, } from '../common/json';
import * as TYPES from '../common/types';
import { TOKEN, } from '../common/token';


export class HybroView extends React.Component {

    webListeners = {};
    promises = {};

    componentWillUnmount() {
        this.invoker.destroy();
    }

    handleRef = (webview) => {
        this.webview = webview;
    }

    handleMessage = (event) => {
        const { data } = event.nativeEvent;

        if (data.indexOf(TOKEN) === 0) {
            const payload = JSON.parse(data.replace(TOKEN, ''));

            if (payload.args) {
                payload.args = parse(payload.args);
            }

            if (payload.result) {
                payload.result = parse(payload.result);
            }

            const type = payload.type;

            if (type == TYPES.INVOKE || type == TYPES.ADD_EVENT_LISTENER || type == TYPES.REMOVE_EVENT_LISTENER) {
                this.invoker.handleRequest(payload.id, payload.type, payload.args);
            }
            else {
                this.invoker.handleResult(payload.commandId, payload.type, payload.result);
            }
        }
    }

    sendRequest = (id, type, args) => {
        this.sendData(id, type, args, 'args');
    }

    sendResult = (commandId, type, result) => {
        this.sendData(uuid(), type, result, 'result', commandId);
    }

    sendData = (id, type, data, dataField, commandId) => {
        data = stringify(data);

        let index = 0,
            size = 100000,
            parts = Math.ceil(data.length / size);

        while (data) {
            this.sendMessage({
                id,
                type,
                commandId,
                [dataField]: data.substr(0, size),
                parts,
                index,
            });
            data = data.substr(size);
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


    invoker = new Invoker(this.props.packages, this.sendRequest, this.sendResult);

    invoke(pckg, mdl, method, params) {
        return this.invoker.invoke(pckg, mdl, method, params);
    }

    addEventListener(pckg, mdl, evnt, listener) {
        return this.invoker.addEventListener(pckg, mdl, evnt, listener);
    }

    removeEventListener(pckg, mdl, evnt, listener) {
        return this.invoker.removeEventListener(pckg, mdl, evnt, listener);
    }

}
