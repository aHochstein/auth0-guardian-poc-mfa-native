import {useAuth0} from 'react-native-auth0';
import BrandedButton from './BrandedButton';
import config from '../auth0-configuration'
import { View, Text } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useState, useContext } from 'react';
import { AuthenticationContext } from '../contexts/AuthenticationContext';

export default function LoginButton() {
    const [authState,setAuthState, auth0Client] = useContext(AuthenticationContext);
    const [email, onEmailChange] = useState('');
    const [password, onPasswordChange] = useState('');
    const {user, authorize, } = useAuth0();

    const onPress = async () => {
        try {
            const result = await auth0Client.auth
                .passwordRealm({
                    username: email,
                    password: password,
                    scope: 'openid email enroll offline_access',
                    audience : config.mfaAudience,
                    realm: 'Username-Password-Authentication',
                });
            setAuthState({
                signedIn: true,
                accessToken: result.accessToken
            });
                console.log(result);
        } catch (e) {
            console.log(e);
        }
    };

    return <View>
        <Text>Email</Text>
        <TextInput value={email} onChangeText={onEmailChange} placeholder='email'></TextInput>
        <Text>Password</Text>
        <TextInput secureTextEntry={true} value={password} onChangeText={onPasswordChange} placeholder='email'></TextInput>
        <BrandedButton onPress={onPress} title="SIGN IN" />
    </View>;
}