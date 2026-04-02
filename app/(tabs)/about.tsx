import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";

export default function About() {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://media1.tenor.com/m/Ib9MX00X2nIAAAAC/cat-plane.gif",
        }}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },

  image: { width: 200, height: 200 },
});
