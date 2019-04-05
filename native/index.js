import React from 'react';
import { WebView as RNWebView, } from 'react-native';
import { WebView, } from 'react-native-webview-messaging/WebView';
import PropTypes from 'prop-types';
import uuid from 'uuid/v1';


import { stringify, parse, } from '../common/json';
import * as TYPES from '../common/types';


export class HybroView extends React.Component {

    static propTypes = {
        ...RNWebView.propTypes,
        packages: PropTypes.object.isRequired,
    }

    webListeners = {};


    componentDidMount() {
        if (this.webview && this.webview.messagesChannel) {
            this.webview.messagesChannel.addListener('json', this.onWebMessage);
        }
        else {
            console.warn('Hybro: no webview');
        }
    }

    componentWillUnmount() {
        if (this.webview && this.webview.messagesChannel) {
            this.webview.messagesChannel.removeListener('json', this.onWebMessage);
        }
        else {
            console.warn('Hybro: no webview');
        }

        for (let h in this.webListeners) {
            let handler = this.webListeners[h];
            this.props.packages[handler.pckg][handler.mdl].removeEventListener(handler.eventName, handler);
            delete this.webListeners[h];
        }
    }

    onWebMessage = (command) => {
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

    render() {
        let { packages, ...others } = this.props;

        return (
            <WebView
                ref={this.handleRef}
                {...others}
            />
        );
    }

    sendResult = (command, type, result) => {
        if (this.webview && this.webview.messagesChannel) {
            result = stringify(result);

            let id = uuid(),
                index = 0,
                size = 100000,
                parts = Math.ceil(result.length / size);

            while (result) {
                this.webview.sendJSON({
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
        else {
            console.warn('Hybro: no webview');
        }
    }

    handleRef = (webview) => {
        this.webview = webview;
    }

}


function getListenerHash(pckg, mdl, eventName, id) {
    return `${pckg}_${mdl}_${eventName}_${id}`;
}
