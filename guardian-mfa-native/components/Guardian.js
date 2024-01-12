import { Button, View, Text } from 'react-native';
import {useState, useEffect, useContext} from 'react';
import messaging from '@react-native-firebase/messaging';
import config from '../auth0-configuration';
import Auth0Guardian from 'react-native-auth0-guardian';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BrandedButton from './BrandedButton';
import MfaService from './mfa/MfaService';
import jwtDecode from 'jwt-decode';
import { AuthenticationContext } from '../contexts/AuthenticationContext';

export default function Guardian() {
    Auth0Guardian.initialize(config.guardianServiceUrl);
    const [authState,setAuthState, auth0Client] = useContext(AuthenticationContext);

    const [enrolled, setEnrolled] = useState(false);
    const [otp, setOtp] = useState('-');
 
    const [accessToken, setAccessToken] = useState(); 

    const setAndCleanAccessToken = (accessToken) => {
      let decodedToken = jwtDecode(accessToken); 
      setAccessToken(JSON.stringify(decodedToken, null, 2));
    }

    useEffect(() => {
        const fetchAccessToken = async () => {
          let accessToken = authState.accessToken;
          setAndCleanAccessToken(accessToken);
        }
        if(!accessToken) {
          fetchAccessToken();
        }
        retrieveEnrolled();
         if(enrolled) {
           setInterval(async () => setOtpHook(), 1000);
        }
    }, );

    const setOtpHook = async () => {
      const totpCode = await Auth0Guardian.getTOTP();
      setOtp(totpCode);
    }

    const getOtp = async () => {
      return await Auth0Guardian.getTOTP();
    }

    const enroll = async () => {
        await Auth0Guardian.initialize(config.guardianServiceUrl);
        var deviceToken = await messaging().getToken();
        var json = await MfaService.associate(authState.accessToken);
        try {
                const isEnrolled = await Auth0Guardian.enroll(json.barcode_uri, deviceToken);
                console.log('Enrolled:' + isEnrolled)
                saveEnrolled();
                setEnrolled(true);
            } catch (err)  {
                console.log(err)
            }
    };

    const unenroll = async () => {
        try {
            await Auth0Guardian.initialize(config.guardianServiceUrl);
            const isUnenrolled = await Auth0Guardian.unenroll();
            console.log('Unenrolled:' + isUnenrolled)
            removeEnrolled();
            setEnrolled(false);
        } catch (err) {
            console.log(err)
        }
    }

    const triggerMfa = async () => {
      var credentials = authState.accessToken;
      var mfaToken = await MfaService.retrieveMfaToken(credentials.refreshToken);
      let res = await MfaService.completeChallengeWithOtp(await getOtp(),mfaToken);
      if(res.access_token) {
        setAndCleanAccessToken(res.access_token);
      }
    }

    const saveEnrolled = async () => {
        try {
          await AsyncStorage.setItem(
            'guardian',
            JSON.stringify(true),
          );
        } catch (error) {
            console.log(error);
        }
      };

      const removeEnrolled = async () => {
        try {
          await AsyncStorage.removeItem('guardian');
        } catch (error) {
            console.log(error);
        }
      };

      const retrieveEnrolled = async () => {
        try {
          let value = await AsyncStorage.getItem('guardian');
          if (value !== null) {
            value = JSON.parse(value);
            setEnrolled(value);
          }
        } catch (error) {
            console.log(error);
        }
      };

    return (
        <View>
            <Text>{accessToken}</Text>
            {!enrolled && <BrandedButton onPress={enroll} title="Enroll Device for Guardian Push" />}
            {enrolled && <BrandedButton onPress={unenroll} title="Unenroll Device from Guardian Push" />}
            {enrolled && <Text style={{fontSize: 20, textAlign: 'center'}} >Current OTP: {otp}</Text>}
        </View>
        
    )
}