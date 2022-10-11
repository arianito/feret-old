import { metadata, metadataOf } from './metadata';
import { Store } from './service';

/**
 * Mark class members to be persisted
 */
export function persisted(target: any, key: string) {
  const { saved = [] } = metadataOf(target);
  metadata(target, {
    saved: [...saved, key],
  });
}

/**
 * Get snapshot of whole services at once, usefull when you want to store them
 * @param context current store
 * @returns get a snapshot of all persisted variables in services
 */
export function getSnapshot(context: Store) {
  return context.services.reduce((acc, service) => {
    const obj = getServiceSnapshot(service);
    if (obj) acc[getServiceKey(service)] = obj;
    return acc;
  }, {} as any);
}

function getServiceSnapshot(service: any): any {
  const { saved = [] } = metadataOf(service);
  if (saved.length > 0) {
    const obj: Record<string, any> = {};
    saved.forEach((key) => {
      obj[key] = service[key];
    });
    return obj;
  }
}

/**
 * Restore stored data onto services
 * @param context  store context
 * @param d data to restore onto services
 */
export function restoreSnapshot(context: Store, d: any) {
  context.services.forEach((service) => {
    restoreServiceSnapshot(service, d[getServiceKey(service)]);
  });
}

function getServiceKey(service: any) {
  const { id, name, version = 1 } = metadataOf(service);
  const svcName = name || id; 
  return [svcName, version].join('-');
}

function restoreServiceSnapshot(service: any, data: any) {
  const { saved = [] } = metadataOf(service);
  if (saved.length > 0) {
    if (data) {
      saved.forEach((key) => {
        if (typeof data[key] !== 'undefined') {
          service[key] = data[key];
        }
      });
    }
  }
  return false;
}

/**
 * Automate persisting the services in browser
 * @param data initial data
 * @param onSave fires when a change accured in document state
 */
export function browserPersist(
  context: Store,
  data: string | null,
  onSave: (data: string) => void,
) {
  if (data) restoreSnapshot(context, JSON.parse(data));

  // check window state changes
  ['visibilitychange', 'pagehide', 'freeze'].forEach((type) => {
    window.addEventListener(
      type,
      () => {
        if (type === 'visibilitychange' && document.visibilityState === 'visible') return;
        onSave(JSON.stringify(getSnapshot(context)));
      },
      { capture: true },
    );
  });
}

/**
 * Define service version, usefull when user data must be updated based on new releases
 * @param version current service build
 */
export function Version(version: number) {
  return function (target: any) {
    metadata(target.prototype, { version });
    return target;
  };
}

/**
 * Define a name for a service, usefull when you have inconsistent import order
 * @Annotated("Some Service") @Service
 * class Temp {
 *   ...
 * @param name service name, must be unique between all services
 */
 export function Annotated(name: string) {
  return function (target: any) {
    metadata(target.prototype, { name });
    return target;
  };
}