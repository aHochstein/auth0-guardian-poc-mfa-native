import {useAuth0} from 'react-native-auth0';
import BrandedButton from './BrandedButton';


export default function LogoutButton( ) {
    const {clearSession} = useAuth0();

    const onPress = async () => {
        try {
            await clearSession();
        } catch (e) {
            console.log(e);
        }
    };

    return <BrandedButton onPress={onPress} title="SIGN OUT" />
}