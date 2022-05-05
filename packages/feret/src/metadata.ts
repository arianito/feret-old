export const config = {
  counter: 0,
  services: [] as any[],
};

export type Metadata = {
  id: number;
  order: number;
  observables: string[];
};

export function metadataOf(target: any): Metadata {
  return target.metadata || {};
}

export function metadata(target: any, value: Partial<Metadata>) {
  Object.defineProperty(target, "metadata", {
    configurable: true,
    enumerable: false,
    writable: false,
    value: {
      ...metadataOf(target),
      ...value,
    },
  });
}
