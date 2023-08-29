import LoginButton from './LoginButton';
import { View, Text, StyleSheet, Image} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth0 } from 'react-native-auth0';
import LogoutButton from './LogoutButton';
import Guardian from './Guardian';
import BrandedButton from './BrandedButton';


export default function Home({ navigation }) {
    const { user } = useAuth0();

    const goToSettings = () => {
        navigation.navigate("Settings");
    }

    const loggedIn = user !== undefined && user !== null;
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
                <Text>Welcome {user.name}</Text>
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