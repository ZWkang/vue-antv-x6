// import type { Emitter } from 'mitt';
// import mitt from 'mitt';

import { CustomMap } from "./customMap";
import type { CustomMapType } from './customMap';

type Events = Record<string, (...arg: any[]) => void>

export type BuildEventBase<T extends Record<string, unknown>> = {
  [K in keyof T as T[K] extends (...arg: any[]) => void ? K : never]: T[K]
}

type EventEmitterInterface<T extends Events = Events, Name extends keyof T = keyof T, Value extends T[Name] = T[Name]> = {
  on(eventName: Name, fn: Value): void;
  emit(eventName: Name, ...args: Parameters<Value>): void;
  addEvent(eventName: Name, fn: Value): void;
  trigger(eventName: Name, ...args: Parameters<Value>): void;
  triggerWrapper(eventname: Name): (...args: Parameters<Value>) => void;
  off(eventName: Name, fn?: Value): void;
  dispose(): void;
}

type turnRecordToRecordList<T> = {
  [key in keyof T]: T[key][]
}

export class EventEmitter<T extends Events = Events, Name extends keyof T = keyof T> implements EventEmitterInterface<T>{
  public managers: CustomMapType<turnRecordToRecordList<T>>;
  constructor() {
    this.managers = CustomMap<turnRecordToRecordList<T>>();
  }

  addEvent(eventname: Name, callback: T[Name]): void {
    if (this.managers.has(eventname)) {
      const list = this.managers.get(eventname);
      const copy = list?.slice()
      copy?.push(callback);
      this.managers.set(eventname, copy!)
      return;
    }
    const newManagers = [callback];
    this.managers.set(eventname, newManagers);
  }

  on(eventName: Name, callback: T[Name]) {
    this.addEvent(eventName, callback);
  }
  emit(eventName: Name, ...args: Parameters<T[Name]>) {
    const handlers = this.managers.get(eventName)
    handlers?.forEach(handle => {
      handle(...args);
    })

    const allHandlers = this.managers.get('*') ?? []
    allHandlers?.forEach(handle => {
      handle(...args);
    })
  }

  trigger(eventname: Name, ...args: Parameters<T[Name]>) {
    this.emit(eventname, ...args)
  }

  triggerWrapper(eventName: Name) {
    return (...args: Parameters<T[Name]>) => this.emit(eventName, ...args)
  }

  off(eventName: Name, fnc?: T[Name]) {
    if (typeof fnc === 'undefined') {
      const managerList = this.managers.get(eventName);
      const newManagerList = managerList?.filter(item => item !== fnc) ?? [];
      this.managers.set(eventName, newManagerList);
      return;
    }
    this.managers.set(eventName, []);
  }

  dispose() {
    this.managers.clear();
  }
}
