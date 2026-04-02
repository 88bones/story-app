import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "height" : "padding"}
      style={styles.keyboard}
    >
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign In to Continue</Text>
          <View style={styles.form}>
            <TextInput
              placeholder="Email..."
              placeholderTextColor={"#999"}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              placeholder="Password..."
              placeholderTextColor={"#999"}
              autoComplete="password"
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text style={styles.linkButtonText}>
                Don't have an account?{" "}
                <Text style={styles.linkText}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    width: "100%",
  },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 24, width: "100%" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32, color: "#666" },
  form: { width: "100%" },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  button: {
    backgroundColor: "black",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: 600 },
  linkButton: { marginTop: 24, alignItems: "center" },
  linkButtonText: { color: "#666", fontSize: 14 },
  linkText: {
    fontWeight: "bold",
  },
});
