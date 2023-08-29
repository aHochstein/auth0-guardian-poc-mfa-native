import {useAuth0} from 'react-native-auth0';
import BrandedButton from './BrandedButton';
import config from '../auth0-configuration'

export default function LoginButton() {
    const {user, authorize} = useAuth0();

    const onPress = async () => {
        try {
            await authorize({scope: 'openid email enroll offline_access', audience : config.mfaAudience});
        } catch (e) {
            console.log(e);
        }
    };

    return <BrandedButton onPress={onPress} title="SIGN IN" />
}