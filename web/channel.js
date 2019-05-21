import EventEmitter from 'events';

import { TOKEN, } from '../common/token';

window.HybroChannel = Object.assign(new EventEmitter(), {

    sendMessage(json) {
        window.ReactNativeWebView.postMessage(TOKEN + JSON.stringify(json));
    },

});

export default window.HybroChannel;
