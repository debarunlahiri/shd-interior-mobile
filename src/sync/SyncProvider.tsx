import NetInfo, { NetInfoStateType } from "@react-native-community/netinfo";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { subscribeToOutbox } from "../database";
import {
  getLastSyncAt,
  getPendingSyncCount,
  isApiConfigured,
  processSyncQueue,
} from "./engine";

export type ConnectivityState = "checking" | "online" | "offline";
export type SyncStatus = "idle" | "syncing" | "paused" | "error" | "synced";

type SyncContextValue = {
  connectivity: ConnectivityState;
  connectionType: NetInfoStateType | null;
  pendingCount: number;
  status: SyncStatus;
  apiConfigured: boolean;
  lastSyncAt: string | null;
  error: string | null;
  remoteRevision: number;
  syncNow: () => Promise<void>;
};

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [connectivity, setConnectivity] =
    useState<ConnectivityState>("checking");
  const [connectionType, setConnectionType] = useState<NetInfoStateType | null>(
    null,
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remoteRevision, setRemoteRevision] = useState(0);
  const syncingRef = useRef(false);

  const refreshQueueState = useCallback(async () => {
    const [count, syncedAt] = await Promise.all([
      getPendingSyncCount(),
      getLastSyncAt(),
    ]);
    setPendingCount(count);
    setLastSyncAt(syncedAt);
    if (!isApiConfigured && count > 0) setStatus("paused");
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current || connectivity !== "online" || !isApiConfigured) {
      return;
    }
    syncingRef.current = true;
    setStatus("syncing");
    setError(null);
    try {
      const result = await processSyncQueue();
      setPendingCount(result.pendingCount);
      if (result.appliedChanges > 0) {
        setRemoteRevision((current) => current + 1);
      }
      if (result.status === "error") {
        setStatus("error");
        setError(result.error ?? "Sync failed");
      } else if (result.status === "unconfigured") {
        setStatus("paused");
      } else {
        setStatus(result.pendingCount === 0 ? "synced" : "idle");
      }
      setLastSyncAt(await getLastSyncAt());
    } finally {
      syncingRef.current = false;
    }
  }, [connectivity]);

  useEffect(() => {
    refreshQueueState().catch(() => undefined);
    return subscribeToOutbox(() => {
      refreshQueueState().catch(() => undefined);
    });
  }, [refreshQueueState]);

  useEffect(() => {
    return NetInfo.addEventListener((network) => {
      setConnectionType(network.type);
      if (network.isConnected === null) {
        setConnectivity("checking");
      } else if (network.isConnected && network.isInternetReachable !== false) {
        setConnectivity("online");
      } else {
        setConnectivity("offline");
        setStatus((current) => (current === "syncing" ? "idle" : current));
      }
    });
  }, []);

  useEffect(() => {
    if (connectivity === "online" && pendingCount > 0) {
      syncNow().catch(() => undefined);
    }
  }, [connectivity, pendingCount, syncNow]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (connectivity === "online" && pendingCount > 0) {
        syncNow().catch(() => undefined);
      }
    }, 30_000);
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        NetInfo.refresh().catch(() => undefined);
        refreshQueueState().catch(() => undefined);
      }
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [connectivity, pendingCount, refreshQueueState, syncNow]);

  const value = useMemo<SyncContextValue>(
    () => ({
      connectivity,
      connectionType,
      pendingCount,
      status,
      apiConfigured: isApiConfigured,
      lastSyncAt,
      error,
      remoteRevision,
      syncNow,
    }),
    [
      connectivity,
      connectionType,
      pendingCount,
      status,
      lastSyncAt,
      error,
      remoteRevision,
      syncNow,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSyncStatus() {
  const value = useContext(SyncContext);
  if (!value) throw new Error("useSyncStatus must be used within SyncProvider");
  return value;
}
