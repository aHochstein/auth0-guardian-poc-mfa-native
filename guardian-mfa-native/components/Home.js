import LoginButton from './LoginButton';
import { View, Text, StyleSheet, Image} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LogoutButton from './LogoutButton';
import Guardian from './Guardian';
import BrandedButton from './BrandedButton';
import { useContext } from 'react';
import { AuthenticationContext } from '../contexts/AuthenticationContext';


export default function Home({ navigation }) {
    const [authState] = useContext(AuthenticationContext);

    const goToSettings = () => {
        navigation.navigate("Settings");
    }

    const loggedIn = authState.signedIn !== undefined && authState.signedIn;
    return (
        <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
        </View>
        <View style={styles.body}> 
            {!loggedIn &&
                <LoginButton/>
            }
            {loggedIn &&
            <View>
                <BrandedButton onPress={goToSettings} title="MFA" />
                <LogoutButton></LogoutButton>
            </View>
            }
        </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
    },
    header: {
        flex: 2,
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 5
    },
    body: {
        flex: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    image: {
        flex: 1,
        width: 120,
        height: null,
        resizeMode: 'contain'
    }
  });