# Bridge RA API in a React App with Capacitor
In this guide, we shall be using [Capacitor](https://capacitorjs.com) to run our simple React App natively on an android device.

This guide assumes you have already followed the [Bridge Reliant Application Getting Started Guide](https://developer.mastercard.com/cp-kernel-integration-api/tutorial/bridge-ra-getting-started-guide/) (Section 1 - 6) and you are ready to start calling the Community Pass Kernel APIs.

We shall be lauching a `saveBiometricConsent` Intent to get the `consentID`. This should give us a clear picture on how to go about consuming the rest of the [Bridge RA APIs](https://developer.mastercard.com/cp-kernel-integration-api/documentation/reference-pages/bridge-ra-api-reference/)

You can find the final code on this [GitHub Repo](https://github.com/kal-J/react-bridge-ra/)

## The base requirements
- Node v16.20.0 or later

## Simple React App
1. Create a new React Project
```
npx create-react-app react-bridge-ra --typescript
```
2. cd into your project
```
cd react-bridge-ra
```
3. Install the required dependencies
```
npm install @capacitor/cli@5.0.5 @capacitor/core@5.0.5 @capacitor/android@5.0.5 @awesome-cordova-plugins/core@6.3.0 @awesome-cordova-plugins/web-intent@6.3.0 com-darryncampbell-cordova-plugin-intent@2.2.0 rxjs@7.8.1 @ionic/core@7.0.12 @ionic/react@7.0.12
```

4. Building our UI

In this step, we shall be putting together the UI for our simple app. We shall be utilizing some [Ionic UI components](https://ionicframework.com/docs/react/adding-ionic-react-to-an-existing-react-project) but you are free to build your own or use any other UI components library.
In the final code, I added [Tailwind CSS](https://tailwindcss.com/docs/guides/create-react-app) for styling but you are free to skip this section.

### Add Tailwind CSS
- Install tailwind css
```
npm install -D tailwindcss
```
-  Add below code to the `tailwind.config.js` file in root of your project.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
- Add below code to the `index.css` file under `src` directory.
```js
@tailwind base;
@tailwind components;
@tailwind utilities;

```
### Building the components

- Firstly, head over to `index.js` in `/src` directory and add below code.
```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IonApp } from '@ionic/react';

import '@ionic/react/css/core.css';
import { setupIonicReact } from '@ionic/react';

setupIonicReact();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <IonApp>
      <App />
    </IonApp> 
  </React.StrictMode>
);

```
- Include your Bridge RA Package name, Program Guid, Reliant Guid in the `/src/env.js` file.

```js
export const PROGRAM_GUID = "<Your Program Guid here>";
export const RELIANT_GUID = "<Your Reliant Guid here>";
export const PACKAGE_NAME = "<Your Bridge RA package name here>"
```

- Create Android Platform for Capacitor
```
npx cap init && npx cap add android
```
The above command should create an `android` directory

- Copy the keystore file used to sign the Bridge RA APK file in [Step 4 of the getting started guide](https://developer.mastercard.com/cp-kernel-integration-api/tutorial/bridge-ra-getting-started-guide/step4) into the `android/app` directory.

- Add a `signingConfigs` to the `android/app/build.gradle` under the `android` namespace
```gradle
android {
    ...

    signingConfigs {
        debug {
            storeFile file('./<Replace with your keystore file name>')
            storePassword '<Replace with your store password>'
            keyAlias '<Replace with your keystore alias>'
            keyPassword '<Replace with your keyPassword>'
        }
    }

    ...
}

```

- Add below intent-filter to the `android/app/src/main/AndroidManifest.xml`

```
<intent-filter>
    <action android:name="com.darryncampbell.cordova.plugin.intent.ACTION"/>
    <category android:name="android.intent.category.DEFAULT"/>
</intent-filter>
```

- Add below permissions to the `android/app/src/main/AndroidManifest.xml`

```
<!-- Permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="com.mastercard.cp3.bridgera.permission.BRIDGE_RELIANT_SECURITY"/>

```

- Add below code to `src/App.jsx` file

```jsx
import { WebIntent } from "@awesome-cordova-plugins/web-intent";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { PACKAGE_NAME, PROGRAM_GUID, RELIANT_GUID } from "./env";

const intentOptions = (extras) => {
  const options = {
    action: WebIntent.ACTION_SEND,
    component: {
      package: PACKAGE_NAME,
      class: "com.mastercard.cp3.bridgera.CommunityPassApiActivity",
    },
    type: "text/plain",
    extras: extras,
  };
  return options;
};

function App() {
  const [responseData, setResponseData] = useState("");
  const [responseError, setResponseError] = useState("");

  const saveBiometricConsent = (consent) => {
    let extras = {
      PROGRAM_GUID: PROGRAM_GUID,
      RELIANT_GUID: RELIANT_GUID,
      REQUEST_CODE: 401,
      REQUEST_DATA: JSON.stringify({ consumerConsentValue: consent }),
    };

    WebIntent.startActivityForResult(intentOptions(extras)).then(
      (res) => {
        if (res) {
          setResponseData(JSON.parse(res.extras?.RESPONSE_DATA));
        }
      },
      (err) => {
        setResponseError(JSON.parse(err.extras?.RESPONSE_ERROR));
      }
    );
  };

  return (
    <>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>React Bridge RA</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="py-4 px-4">
          {!(responseData || responseError) ? (
            <>
              <h1 className="px-4 py-4 mt-2">Capture User Biometrics?</h1>
              <div className="flex w-full justify-between py-5 px-4 space-x-2">
                <IonButton
                  size="large"
                  fill="solid"
                  onClick={() => saveBiometricConsent(true)}
                >
                  Accept
                </IonButton>
                <IonButton
                  size="large"
                  fill="outline"
                  onClick={() => saveBiometricConsent(false)}
                >
                  Decline
                </IonButton>
              </div>
            </>
          ) : null}

          <div className="bg-slate-100  p-8 flex flex-col flex-wrap space-y-4 justify-center items-center">
            {responseData ? (
              <div className="p-4 w-full space-y-2 text-black bg-white flex flex-col flex-wrap">
                <h1>Success Response :</h1>
                <p>
                  responseStatus : {responseData.responseStatus}
                </p>
                <p>
                  consentID : {responseData.consentID}
                </p>
              </div>
            ) : null}

            {responseError ? (
              <div className="p-4 w-full space-y-2 text-black bg-white flex flex-col flex-wrap">
                <h1>Error Response : </h1>
                <p>Error Code : {responseError.code}</p>
                <p>
                  Error Message : {responseError.message}
                </p>
              </div>
            ) : null}
          </div>
        </IonContent>
      </IonPage>
    </>
  );
}

export default App;

```
The above code displays a screen with two buttons, 'ACCEPT' or 'DECLINE' that launch a saveBiometricConsent Intent to get a Biometric consent Id when clicked/pressed. The screen also displays the response or error result from the intent once received.

We make use of the `WebIntent` class imported from the `@awesome-cordova-plugins/web-intent` npm module to launch our Bridge RA intents.
There are two major take aways from the above code.

1. Launching the saveBiometricConsent intent and handling the response
```js
const saveBiometricConsent = (consent) => {
    let extras = {
      PROGRAM_GUID: PROGRAM_GUID,
      RELIANT_GUID: RELIANT_GUID,
      REQUEST_CODE: 401,
      REQUEST_DATA: JSON.stringify({ consumerConsentValue: consent }),
    };

    WebIntent.startActivityForResult(intentOptions(extras)).then(
      (res) => {
        if (res) {
          setResponseData(JSON.parse(res.extras?.RESPONSE_DATA));
        }
      },
      (err) => {
        setResponseError(JSON.parse(err.extras?.RESPONSE_ERROR));
      }
    );
  };

```

2. Intent options object
```js
const intentOptions = (extras) => {
  const options = {
    action: WebIntent.ACTION_SEND,
    component: {
      package: PACKAGE_NAME,
      class: "com.mastercard.cp3.bridgera.CommunityPassApiActivity",
    },
    type: "text/plain",
    extras: extras,
  };
  return options;
}
```

5. Installing & running the App on an Android device
```
npm run build && npx cap copy && npx cap sync android && cd android && ./gradlew installdebug
```
