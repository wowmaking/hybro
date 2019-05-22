# hybro

ReactNative <-> WebView invoke/events communication

---

## ReactNative API

### Installation

```
npm i hybro
```

Install and link [react-native-webview](https://github.com/react-native-community/react-native-webview)

```
npm i react-native-webview
react-native link react-native-webview
```

### Usage example

```javascript
import { HybroView, } from 'hybro/native';

const packages = {
    'react-native': require('react-native'),
};

const uri = __DEV__
    ? 'http://localhost:8080/index.html'
    : Platform.select({
        android: 'file:///android_asset/www/index.html',
        ios: './www/index.html',
    });

<HybroView
    packages={packages}
    source={{ uri }}
    originWhitelist={['*']}
    mixedContentMode={'always'}
    allowUniversalAccessFromFileURLs
/>
```

Assumes you build web app into `android/app/src/main/assets/www` and into `ios/www`.

Add `ios/www` folder into Xcode project (also into `Copy Bundle Resources` Build Phase).

For DEV don't forget to reverse 8080 port for Android emulator:

`adb reverse tcp:8080 tcp:8080`


### HybroView Props

* packages - object of plugged packages with names to call from web side

---

## Web API

```javascript
import { invoke, addEventListener, removeEventListener, } from 'hybro';
```

### invoke(pckg, mdl, method, params)
#### Parameters
* **pckg:** String - plugged package name
* **mdl:** String - module of plugged package
* **method:** String - name of invoked method
* **params:** Array - arguments
```javascript
invoke('react-native', 'Linking', 'getInitialURL')
    .then((url) => {
        if (url) {
            console.log('Initial url is: ' + url);
        }
    })
    .catch(err => console.error('An error occurred', err));

invoke('react-native', 'Linking', 'openURL', [url]);
```

### addEventListener(pckg, mdl, evnt, listener)
#### Parameters
* **pckg:** String - plugged package name
* **mdl:** String - module of plugged package
* **evnt:** String - event type
* **listener:** Function or EventListener - listener function or object
```javascript
addEventListener('react-native', 'Linking', 'url', handleOpenUrl);
```

### removeEventListener(pckg, mdl, evnt, listener)
#### Parameters
* **pckg:** String - plugged package name
* **mdl:** String - module of plugged package
* **evnt:** String - event type
* **listener:** Function or EventListener - listener function or object
```javascript
removeEventListener('react-native', 'Linking', 'url', handleOpenUrl);
```
