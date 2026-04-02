import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
// import { Button, Host } from "@expo/ui/jetpack-compose";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Edit app/index.tsx to edit this screen.
      </Text>
      <Link href={"/about"}>About</Link>
      <TextInput placeholder="Email" />
      <ActivityIndicator size={"large"} />

      {/* <Button onPress={() => router.push("/about")} title="Navigate" />
      <Host matchContents>
        <Button onPress={() => router.push("/about")}>Save Changes</Button>
      </Host> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: {
    color: "red",
  },
});
