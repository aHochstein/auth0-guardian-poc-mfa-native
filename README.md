# Example using react-native-auth0

This repository contains a example implementation of Auth0 Guardian and a native MFA Flow using the authentication api in the background on the same device.

The native flow does need a Action on the Auth0 Tenant that triggers MFA on a refresh token exchange when a additional parameter is present - you can find an example implementation in the actions folder.


## Get access token with enroll scope for MFA API

To use the (MFA Authentication API) [https://auth0.com/docs/api/authentication#multi-factor-authentication] get an access token with the enroll scope. Add the scope to the login request initially. The Audience must be set to the MFA Audience which has the format https://{yourDomain}/mfa/

```js
await authorize({scope: 'openid email enroll offline_access', audience : config.mfaAudience});
```

## Enroll Guardian for MFA via API

To enroll the Device for Guardian MFA get the FCM Token of the Device, the example app does this using @react-native-firebase/messaging. Also initialize the Guardian SDK with your Guardian Service URL which has the format of {yourTenant}.guardian.eu.auth0.com for EU Tenants. Then Post this information to the (MFA Associate API) [https://auth0.com/docs/api/authentication#add-an-authenticator] to start the enrollment of the User into Auth0 Guardian. 

```js
await fetch(config.mfaAudience + 'associate', {
    method: 'POST',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken
    },
    body: JSON.stringify({
        client_id: config.clientId,
        authenticator_types: ["oob"],
        oob_channels: ["auth0"]
    })
}),
```

This API returns an barcode_uri. Use this barcode_uri to initialize the Guardian SDK together with the FCM Token. This will confirm the enrollment automaticly

```js
await Auth0Guardian.enroll(json.barcode_uri, deviceToken);
```

## Confirm a Guardian Push using the SDK

When MFA is triggered and a Push is sent to the Device call the Guardian SDK to confirm or deny the outstanding MFA Request. Ideally you should prompt the User to confirm that he is indeed trying to sign in right now. After the User confirms or denys call the corresponding Guardian Method to allow or deny the Request. Supply the Guardian SDK with the data that was sent with the Push to the Device.

```js
const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    Auth0Guardian.initialize(config.guardianServiceUrl)
    .then(result => {
    if(response.actionIdentifier === 'allow') {
        Auth0Guardian.allow(response.notification.request.content.data).then((isAllowed) => {
        console.log({ isAllowed })
        Notifications.dismissNotificationAsync(response.notification.request.identifier);
        }).catch(error => console.log(error));
        }
        else {
        Auth0Guardian.reject(response.notification.request.content.data).then((isAllowed) => {
        console.log({ isAllowed })
        Notifications.dismissNotificationAsync(response.notification.request.identifier);
        }).catch(error => console.log(error));
        }
    })
})
```

## Trigger background MFA with the same Device to get a MFA Token

Go to the Application page in the Auth0 Dashboard and navigate to Advanced Settings -> Grant Types. Make sure the Grant Types Refresh Token and MFA are enabled. 
To trigger the background OTP exchange add an Action to your Auth0 tenant that checks for an additional parameter at the refresh token exchange and triggers MFA if it is present.
You can check out the example in the actions folder.

To trigger MFA send the additional parameter together with the reresh token against the (token endpoind) [https://auth0.com/docs/api/authentication#get-token]. Extract the MFA Token from the result to complete the challenge with it.

```js
var body = {
    'client_id': config.clientId,
    'refresh_token': refreshToken,
    'grant_type': 'refresh_token',
    'request_mfa' : 'true'
};

var formBody = [];
for (var property in body) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(body[property]);
    formBody.push(encodedKey + "=" + encodedValue);
}
formBody = formBody.join("&");

let result = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody
});

let json = await result.json();

return json.mfa_token;
```

Get the current OTP from the Guardian SDK.

```js
const otp = await Auth0Guardian.getTOTP();
```

Confirm the outstanding MFA challenge with the OTP and the MFA Token against the token endpoint. Use the (mfa-otp grant) [https://auth0.com/docs/api/authentication#verify-with-one-time-password-otp-] to do so.

```js
var body = {
    'client_id': config.clientId,
    'grant_type': 'http://auth0.com/oauth/grant-type/mfa-otp',
    'mfa_token' : mfaToken,
    'otp' : totpCode
};

var formBody = [];
for (var property in body) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(body[property]);
    formBody.push(encodedKey + "=" + encodedValue);
}
formBody = formBody.join("&");

let result = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody
});
```

The result will be a new access token and id token containing the added claims from the Auth0 Action.
