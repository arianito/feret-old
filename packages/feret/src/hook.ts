import { useEffect, useState } from "react";
import { metadataOf } from "./metadata";
import { useStore } from "./context";

/**
 * Inject and use desired service
 * @param service Service class definition
 * @returns Service instance (singleton)
 */
export function useService<T>(service: { new (...args: any[]): T }): T {
  const store = useStore();
  return store.pick(service);
}

/**
 * Observe specified services, make sure you decorated desired variables with @observable
 * once value changed current component will update automatically
 * @param services Array of Service::class
 */
export function useObserver(services?: { new (...args: any[]): any }[]) {
  const { channel } = useStore();
  const updater = useState({});
  useEffect(() => {
    let released = false;
    const releaseQueue: any[] = [];
    if (services && services.length > 0) {
      const listener = channel.listen((id, variable, value) => {
        if (
          services.some((type) => metadataOf(type.prototype).id === id) &&
          !released
        ) {
          const key = id + variable;
          updater[1]((state: any) => {
            if (typeof state[key] !== "undefined" && state[key] === value)
              return state;
            return {
              ...state,
              [key]: value,
            };
          });
        }
      });
      releaseQueue.push(listener);
    }
    return () => {
      released = true;
      releaseQueue.forEach((func) => func());
    };
  }, []);
}
