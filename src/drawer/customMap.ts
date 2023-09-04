export type CustomMapType<T extends Record<string, unknown> = Record<string, unknown>, Name extends keyof T = keyof T> = {
  get: (name: Name) => T[Name];
  set: (name: Name, data: T[Name]) => void;
  clear: () => void;
  has: (name: Name) => boolean;
  del: (name: Name) => void;
}


export const CustomMap = <T extends Record<string, unknown>>(initialObj: Partial<T> = {}): CustomMapType<T> => {
  let obj = initialObj ?? {};

  function get<Name extends keyof T>(name: Name) {
    return obj[name]!;
  }

  function set<Name extends keyof T>(name: Name, data: T[Name]) {
    obj[name] = data;
  }

  function clear(): void {
    obj = {};
  }

  function has<Name extends keyof T>(name: Name): boolean {
    return !!(obj[name]);
  }

  function del<Name extends keyof T>(name: Name): void {
    delete obj?.[name];
  }

  return {
    get,
    set,
    clear,
    has,
    del
  }
}