import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./src/hooks/useAuth";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { LoginScreen } from "./src/screens/LoginScreen";
import { colors } from "./src/theme";
import { AppDialogProvider } from "./src/components/AppDialog";
import { LocalizationProvider } from "./src/localization";

export default function App() {
  const { session, hydrated, signIn, signOut } = useAuth();

  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <AppDialogProvider>
          <StatusBar style="dark" />
          <SafeAreaView
            style={styles.safeArea}
            edges={["top", "left", "right"]}
          >
            {!hydrated ? (
              <View style={styles.loading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : session ? (
              <AppNavigator session={session} onSignOut={signOut} />
            ) : (
              <LoginScreen onSignIn={signIn} />
            )}
          </SafeAreaView>
        </AppDialogProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
