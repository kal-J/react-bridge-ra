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
