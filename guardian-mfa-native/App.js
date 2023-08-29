import { StyleSheet, Text, View } from 'react-native';
import { Auth0Provider} from 'react-native-auth0';
import config from './auth0-configuration.js'
import React, { useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from "expo-notifications";
import Auth0Guardian from 'react-native-auth0-guardian';
import Home from './components/Home.js';
import Settings from './components/Settings.js';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

Notifications.setNotificationCategoryAsync(
  'mfa',
  [
    { identifier: 'allow', buttonTitle: 'Allow', options : { opensAppToForeground: false, isDestructive: true}},
    { identifier: 'deny', buttonTitle: 'Deny', options : { opensAppToForeground: false, isDestructive: true}}
  ]
)

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      Auth0Guardian.initialize(config.guardianServiceUrl)
      .then(result => {
        console.log('Auth0 Guardian initialized 😎')
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
      .catch(err => console.log(err))
    });
    return () => subscription.remove();
  }, []);

  messaging().onMessage(async remoteMessage => {
    Notifications.scheduleNotificationAsync({
      content: {
        categoryIdentifier: 'mfa',
        title: 'New Login Request',
        body: "Are you logging in right now?",
        data: remoteMessage.data
      },
      trigger: null,
    });
    console.log('Message handled in the background!', remoteMessage);
  });

  return (
    <Auth0Provider domain={config.domain} clientId={config.clientId}>
      <NavigationContainer>
      <Stack.Navigator>
            <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
            />
             <Stack.Screen
            name="Settings"
            component={Settings}
            options={{ headerShown: false }}
            />
      </Stack.Navigator>
      </NavigationContainer>
    </Auth0Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
  }
}