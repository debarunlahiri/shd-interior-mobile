import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./src/hooks/useAuth";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { LoginScreen } from "./src/screens/LoginScreen";
import { colors } from "./src/theme";
import { AppDialogProvider } from "./src/components/AppDialog";
import { LocalizationProvider } from "./src/localization";
import { ThemeProvider, useThemeSettings } from "./src/theme/ThemeProvider";
import { NetworkStatusBanner } from "./src/components/NetworkStatusBanner";
import { SyncProvider, useSyncStatus } from "./src/sync/SyncProvider";

export default function App() {
  return (
    <ThemeProvider>
      <SyncProvider>
        <AppContent />
      </SyncProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { session, hydrated, signIn, signOut, updateProfile } = useAuth();
  const { resolvedScheme } = useThemeSettings();
  const { remoteRevision } = useSyncStatus();

  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <AppDialogProvider>
          <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />
          <SafeAreaView
            style={styles.safeArea}
            edges={["top", "left", "right"]}
          >
            <NetworkStatusBanner />
            {!hydrated ? (
              <View style={styles.loading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : session ? (
              <AppNavigator
                key={`synced-${remoteRevision}`}
                session={session}
                onSignOut={signOut}
                onUpdateProfile={updateProfile}
              />
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
