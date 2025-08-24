// app/StoreProvider.tsx
"use client"; // This directive makes this component a Client Component

import { FC, ReactNode, useRef } from "react";
import { Provider } from "react-redux";
import { ytubeReduxStore, AppStore } from "@/lib/redux/store"; // Adjust path if needed

interface ReduxStoreProviderProps {
  children: ReactNode;
}

const ReduxStoreProvider: FC<ReduxStoreProviderProps> = ({ children }) => {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = ytubeReduxStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default ReduxStoreProvider;
