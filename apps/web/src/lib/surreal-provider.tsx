import { env } from "@wajeer/env/web";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Surreal } from "surrealdb";

export type SurrealProviderProps = {
  children: ReactNode;
  client?: Surreal;
  endpoint?: string;
  namespace?: string;
  database?: string;
  autoConnect?: boolean;
};

export type SurrealProviderState = {
  client: Surreal;
  isConnecting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
  connect: () => Promise<void>;
  close: () => Promise<void>;
};

const SurrealContext = createContext<SurrealProviderState | undefined>(
  undefined
);

export function SurrealProvider({
  children,
  client,
  endpoint = env.VITE_SURREALDB_URL,
  namespace = env.VITE_SURREALDB_NS,
  database = env.VITE_SURREALDB_DB,
  autoConnect = true,
}: SurrealProviderProps) {
  const [instance] = useState(() => client ?? new Surreal());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const cleanupRef = useRef(false);

  const connect = useCallback(async () => {
    if (!endpoint) {
      setError(new Error("SurrealDB endpoint not configured"));
      setIsError(true);
      return;
    }

    setIsConnecting(true);
    setIsError(false);
    setError(null);

    try {
      await instance.connect(endpoint);

      if (namespace && database) {
        await instance.use({ namespace, database });
      }

      setIsSuccess(true);
    } catch (error) {
      setError(error);
      setIsError(true);
      setIsSuccess(false);
    } finally {
      setIsConnecting(false);
    }
  }, [endpoint, instance, namespace, database]);

  const close = useCallback(async () => {
    try {
      await instance.close();
      setIsSuccess(false);
      setIsConnecting(false);
    } catch {
      // Ignore close errors
    }
  }, [instance]);

  useEffect(() => {
    if (autoConnect && endpoint && !cleanupRef.current) {
      connect().catch(() => {
        // Error is handled by state
      });
    }

    return () => {
      cleanupRef.current = true;
      instance.close().catch(() => {});
    };
  }, [autoConnect, connect, endpoint, instance]);

  const value: SurrealProviderState = useMemo(
    () => ({
      client: instance,
      isConnecting,
      isSuccess,
      isError,
      error,
      connect,
      close,
    }),
    [instance, isConnecting, isSuccess, isError, error, connect, close]
  );

  return (
    <SurrealContext.Provider value={value}>{children}</SurrealContext.Provider>
  );
}

export function useSurreal() {
  const context = useContext(SurrealContext);
  if (!context) {
    throw new Error("useSurreal must be used within a SurrealProvider");
  }
  return context;
}

export function useSurrealClient() {
  return useSurreal().client;
}

export function useSurrealConnection() {
  const { isConnecting, isSuccess, isError, error } = useSurreal();
  return { isConnecting, isSuccess, isError, error };
}
