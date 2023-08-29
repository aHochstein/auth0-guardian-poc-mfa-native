import { View, StatusBar, StyleSheet } from 'react-native';
import Guardian from './Guardian';

export default function LoginButton() {
   
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <View style={styles.header}>
            </View>
            <View style={styles.body}> 
                <Guardian></Guardian>
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