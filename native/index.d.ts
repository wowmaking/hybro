import { Component, } from 'react';
import { WebViewProps, } from 'react-native-webview';


export interface HybroViewProps extends WebViewProps {
    /**
     * The dictionary of plugged packages.
     */
    packages: {
        [pckg: string]: Object,
    };
}

declare class HybroView extends Component<HybroViewProps> {
}

export { HybroView, };
