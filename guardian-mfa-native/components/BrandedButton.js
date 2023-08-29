import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function BrandedButton(props) {

    return (
        <View style={styles.button}>
             <Pressable onPress={props.onPress} >
                <Text style={styles.buttonText}>{props.title}</Text>
            </Pressable>
        </View>
       
    )
}
const styles = StyleSheet.create({
button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#000000',
    marginBottom: 5,
    marginTop: 5
  },
  buttonText: {
    fontFamily: 'Arial',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white'
  }});
