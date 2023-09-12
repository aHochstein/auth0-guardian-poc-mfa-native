# Example using react-native-auth0

## Get access token with enroll scope for MFA API

To use the (MFA Authentication API) [https://auth0.com/docs/api/authentication#multi-factor-authentication] you need an access token with the enroll scope. Add the scope to the login request initially. The Audience must be set to the MFA Audience which has the format https://{yourDomain}/mfa/

```js
await authorize({scope: 'openid email enroll offline_access', audience : config.mfaAudience});
```

## Enroll Guardian for MFA via API

To enroll the Device for Guardian MFA you will need to get the FCM Token of the Device, the example app does this using @react-native-firebase/messaging. Also you need to initialize the Guardian SDK with your Guardian Service URL which has the format of {yourTenant}.guardian.eu.auth0.com for EU Tenants. You then need to Post this information to the (MFA Associate API) [https://auth0.com/docs/api/authentication#add-an-authenticator]. 

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

This API will return you an barcode_uri which you need to supply to the Guardian SDK together with the FCM Token to end the enrollment.

```js
await Auth0Guardian.enroll(json.barcode_uri, deviceToken);
```

## Confirm a Guardian Push using the SDK

Once the Push Notification hits the Device you need to call the Guardian SDK to confirm the outstanding MFA Request. You can do this however you like but ideally you should prompt the User to confirm that he is indeed trying to sign in right now. After the User confirms this just call the Guardian SDK with the information received in the Push.

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
