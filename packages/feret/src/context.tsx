import React, { useContext, createContext } from "react";
import { Store } from "./service";

const FeretContext = createContext<Store>({} as Store);

/**
 * @returns the Store instance
 */
export function useStore() {
  const store = useContext(FeretContext);
  return store;
}

/**
 * Use this wrapper at the highest hierarchy of your application
 * @returns
 */
export function FeretProvider(props: { store: Store; children?: any }) {
  return (
    <FeretContext.Provider value={props.store}>
      {props.children}
    </FeretContext.Provider>
  );
}
