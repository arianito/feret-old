export const config = {
  counter: 0,
  services: [] as any[],
};

export type Metadata = {
  id: number;
  name: string;
  order: number;
  version: number;
  observables: string[];
  saved: string[];
};

export function metadataOf(target: any): Metadata {
  return target.__metadata__ || {};
}

export function metadata(target: any, value: Partial<Metadata>) {
  Object.defineProperty(target, '__metadata__', {
    configurable: true,
    enumerable: false,
    writable: false,
    value: {
      ...metadataOf(target),
      ...value,
    },
  });
}
