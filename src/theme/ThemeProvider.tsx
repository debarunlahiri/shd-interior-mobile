import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { setActiveColorScheme } from "../theme";

const STORAGE_KEY = "@shd-interior/theme-preference-v1";

export type ThemePreference = "system" | "light" | "dark";

type ThemeSettings = {
  preference: ThemePreference;
  resolvedScheme: "light" | "dark";
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
  revision: number;
};

const ThemeSettingsContext = createContext<ThemeSettings | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [revision, setRevision] = useState(0);
  const resolvedScheme =
    (preference === "system" ? systemScheme : preference) === "dark"
      ? "dark"
      : "light";

  useLayoutEffect(() => {
    if (setActiveColorScheme(resolvedScheme)) {
      setRevision((current) => current + 1);
    }
  }, [resolvedScheme]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (isThemePreference(saved)) {
          setPreferenceState(saved);
        }
      })
      .catch(() => undefined);
  }, []);

  const setPreference = (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    AsyncStorage.setItem(STORAGE_KEY, nextPreference).catch(() => undefined);
  };

  const value = useMemo<ThemeSettings>(() => {
    return {
      preference,
      resolvedScheme,
      revision,
      setPreference,
      cyclePreference: () => {
        const next =
          preference === "system"
            ? "light"
            : preference === "light"
              ? "dark"
              : "system";
        setPreference(next);
      },
    };
  }, [preference, resolvedScheme, revision]);

  return (
    <ThemeSettingsContext.Provider value={value}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings() {
  const value = useContext(ThemeSettingsContext);
  if (!value) {
    throw new Error("useThemeSettings must be used within ThemeProvider");
  }
  return value;
}
