import BrandedButton from './BrandedButton';
import { useContext } from 'react';
import { AuthenticationContext } from '../contexts/AuthenticationContext';


export default function LogoutButton( ) {
    const [authState,setAuthState, auth0Client] = useContext(AuthenticationContext);

    const onPress = async () => {
        try {
            setAuthState({signedId: false, accessToken : null});
        } catch (e) {
            console.log(e);
        }
    };

    return <BrandedButton onPress={onPress} title="SIGN OUT" />
}