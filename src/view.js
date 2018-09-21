import React from 'react';
import { requireNativeComponent, View, NativeModules, NativeEventEmitter, } from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    ...View.propTypes,
    packages: PropTypes.object.isRequired,
};

const { Hybro, } = NativeModules;

class HybroView extends React.Component {

    emitter = new NativeEventEmitter(Hybro);

    cordovaListeners = {};

    componentDidMount() {
        this.invokeSubscription = this.emitter.addListener('cordova-invoke', this.onInvoke);
        this.addListenerSubscription = this.emitter.addListener('cordova-add-listener', this.onAddListener);
        this.removeListenerSubscription = this.emitter.addListener('cordova-remove-listener', this.onRemoveListener);
    }

    componentWillUnmount() {
        this.invokeSubscription.remove();
        this.addListenerSubscription.remove();
        this.removeListenerSubscription.remove();
    }

    onInvoke = (event) => {
        let [pckg, mdl, method, params] = event.args;
        params = params || [];

        try {
            Promise.all([
                this.props.packages[pckg][mdl][method](...params),
            ])
                .then(([result]) => {
                    Hybro.success(event.callbackId, { result, }, false); // pass params back for stress test
                }, (error) => {
                    Hybro.error(event.callbackId, error && error.message || '');
                });
        }
        catch (ex) {
            Hybro.error(event.callbackId, ex.message);
        }
    }

    onAddListener = (event) => {
        let [pckg, mdl, eventName] = event.args;

        try {
            let handler = (result) => {
                Hybro.success(event.callbackId, { result, isEmit: true, }, true);
            };
            let result = this.props.packages[pckg][mdl].addListener(eventName, handler);

            this.cordovaListeners[`${pckg}_${mdl}_${eventName}_${event.callbackId}`] = handler;

            Hybro.success(event.callbackId, { result, callbackId: event.callbackId, }, true);
        }
        catch (ex) {
            Hybro.error(event.callbackId, ex.message);
        }
    }

    onRemoveListener = (event) => {
        let [pckg, mdl, eventName, callbackId] = event.args;

        try {
            let handler = this.cordovaListeners[`${pckg}_${mdl}_${eventName}_${callbackId}`],
                result = this.props.packages[pckg][mdl].removeListener(eventName, handler);

            Hybro.success(event.callbackId, { result, }, false);
        }
        catch (ex) {
            Hybro.error(event.callbackId, ex.message);
        }
    }

    render() {
        return (
            <RNHybroView
                style={{ flex: 1 }}
            />
        );
    }

}

HybroView.propTypes = propTypes;
const RNHybroView = requireNativeComponent('HybroView', HybroView);

export default HybroView;
