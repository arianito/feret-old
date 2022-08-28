import { config, metadata, metadataOf } from './metadata';

const identifier = 0x56837736;

export type Store = {
  channel: EventBus;
  services: any[];
  pick<T>(service: { new (container?: Store): T }): T;
  orderedInvoke(fn: string, ...args: any[]): Promise<void>;
  invoke(fn: string, ...args: any[]): Promise<void>;
};

/**
 * Mark which classes going to be used as Service
 * @Service
 * class Temp {
 *   ...
 */
export function Service<T extends { new (...args: any[]): any }>(target: T) {
  const id = config.counter++;
  config.services[id] = target;
  metadata(target.prototype, { id });
  return target;
}

/**
 * Mark which properties are going to be watched
 * @Service
 * class Temp {
 *   @observable variable = undefined;
 */
export function observable(target: any, key: string) {
  const { observables = [] } = metadataOf(target);
  metadata(target, {
    observables: [...observables, key],
  });
}

export enum Ordered {
  HIGHEST_PRECEDENCE = -999999999,
  DEFAULT = 0,
  LOWEST_PRECEDENCE = 999999999,
}

/**
 * Define execution order for services
 * @Order(100) @Service
 * class Temp {
 *   ...
 * @param order -999999999 has the highest precedence and 999999999 for lowest precedence
 */
export function Order(order: number) {
  return function (target: any) {
    metadata(target.prototype, { order });
    return target;
  };
}

/**
 * Inject and use desired service inside other services
 * @param service Service class definition
 * @returns Service instance (singleton)
 */
export function wire<T>(service: { new (...args: any[]): T }): T {
  const { id } = metadataOf(service.prototype);
  return { type: id, identifier: identifier } as unknown as T;
}

class EventBus {
  listeners: any[] = [];
  dispatch = (...args: any[]) => {
    this.listeners.forEach((listener) => listener(...args));
  };
  listen = (listener: (id: number, fn: string, value: any) => void) => {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx > -1) {
        this.listeners.splice(idx, 1);
      }
    };
  };
  detach = (listener: any) => {
    const idx = this.listeners.indexOf(listener);
    if (idx > -1) {
      this.listeners.splice(idx, 1);
    }
  };
}

/**
 * Creates a new Feret Store
 * @returns the Store instance
 */
export function createStore(): Store {
  const container: Store = {} as Store;
  container.channel = new EventBus();
  container.pick = (service) => container.services[metadataOf(service.prototype).id];
  container.orderedInvoke = (fn, ...args: any[]) => invoke(container, false, fn, ...args);
  container.invoke = (fn, ...args: any[]) => invoke(container, true, fn, ...args);
  container.services = config.services.map(
    (target) =>
      new (class extends target {
        context = container;
        constructor(...args: any[]) {
          super(...args);
          Object.getOwnPropertyNames(this)
            .filter(
              (key) =>
                typeof this[key] === 'object' &&
                this[key].toString() === '[object Object]' &&
                this[key].identifier == identifier,
            )
            .forEach((key) => {
              const id = this[key].type;
              Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: () => container.services[id],
                set: () => null,
              });
            });
        }
      })(),
  );
  container.services.forEach((service) => {
    const { id, observables = [] } = metadataOf(service);
    const { channel } = container;
    observables.forEach((key) => {
      const alias = `$$${key}`;
      Object.defineProperty(service, alias, {
        configurable: true,
        writable: false,
        enumerable: false,
        value: service[key],
      });
      Object.defineProperty(service, key, {
        configurable: true,
        enumerable: true,
        get: () => {
          return service[alias];
        },
        set: (value: any) => {
          if (service[alias] !== value) {
            Object.defineProperty(service, alias, {
              configurable: true,
              writable: false,
              enumerable: false,
              value: value,
            });
            if (channel) channel.dispatch(id, key, value);
          }
        },
      });
    });
  });
  container.pick = (target) => {
    const { id } = metadataOf(target.prototype);
    if (!container.services || typeof id === 'undefined') throw new Error('Service not found');
    return container.services[id];
  };
  return container;
}

function invoke(context: Store, parallel: boolean, fn: string, ...args: any[]) {
  const pm = context.services
    .reduce<any[]>((acc, service) => {
      const { order = 0, id } = metadataOf(service);
      if (typeof service[fn] === 'function') {
        acc.push([id, order, service]);
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => a[1] - b[1])
    .map((a: any) => a[2]);

  return Promise.resolve().then(() => {
    if (parallel) return Promise.all(pm.map((service) => service[fn].apply(service, args)));
    return pm.reduce(
      (p, service) => p.then(() => service[fn].apply(service, args)),
      Promise.resolve(),
    );
  });
}
