import React, { PureComponent, } from 'react';
import { Platform, StyleSheet, } from 'react-native';
import { EventTarget, } from 'event-target-shim';
import { HybroView, } from 'hybro/native';

const a = {
  b: Object.assign(new EventTarget(), {
    c: function (...args) {
      return args.join();
    },
  }),
};

setInterval(() => {
  a.b.dispatchEvent({ type: 'e', data: { a: 1, }, });
}, 1000);

export default class App extends PureComponent {

  hybroRef = React.createRef();

  constructor(props) {
    super(props);

    this.packages = { a, };
  }

  hanleLoad = () => {
    setTimeout(() => {
      this.hybroRef.current.invoke('a', 'b', 'c', [1, 'q'])
        .then(console.warn)
        .catch(console.error);
    }, 1000);

    this.hybroRef.current.addEventListener('a', 'b', 'e', console.warn)
      .then(console.warn)
      .catch(console.error);

    setTimeout(() => {
      this.hybroRef.current.removeEventListener('a', 'b', 'e', console.warn)
        .then(console.warn)
        .catch(console.error);
    }, 10000);
  }

  render() {
    const source = {
      uri: __DEV__
        ? 'http://localhost:8080/'
        : Platform.OS === 'android'
          ? 'file:///android_asset/www/index.html'
          : './www/index.html',
    };

    return (
      <HybroView
        ref={this.hybroRef}
        packages={this.packages}
        source={source}
        style={styles.webview}
        onLoad={this.hanleLoad}
        originWhitelist={['*',]}
        mixedContentMode={'always'}
        allowUniversalAccessFromFileURLs
      />
    );
  }

}

const styles = StyleSheet.create({
  webview: {
    width: '100%',
    height: '100%',
  },
});
