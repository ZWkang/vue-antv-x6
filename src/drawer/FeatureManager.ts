import type { DiagramBase } from "./DiagramBase";
import type { FeatureBase } from "./Features/FeatureBase";

export class FeatureContext {
  get diagram() {
    return this.container.diagram
  }
  constructor(public container: DiagramBase) {

  }
}

type ClassStaticProperties<T> = {
  [Key in keyof T as Key extends "prototype" ? never : T[Key] extends (...args: any[]) => any ? never : Key]: T[Key];
}



export class FeatureManager {
  public diagram: any
  public featureContext: {
    diagram: any;
    container: any;
  }

  public managers: Map<string, InstanceType<typeof FeatureBase>>

  constructor(diagram: any) {
    this.diagram = diagram

    this.featureContext = new FeatureContext(diagram);

    this.managers = new Map();
  }

  public appendFeature<T extends typeof FeatureBase>(Feat: T) {
    const ins = new Feat(this.featureContext);

    this.managers.set(Feat.featureName, ins);
    return this;
  }

  public getFeature(name: string) {
    return this.managers.has(name) ? this.managers.get(name) : null;
  }

  public execute() {
    const postList: InstanceType<typeof FeatureBase>[] = [];
    const preList: InstanceType<typeof FeatureBase>[] = [];
    const normalList: InstanceType<typeof FeatureBase>[] = [];

    this.managers.forEach((manager) => {
      if (manager.order === 'normal') {
        normalList.push(manager);
      } else if (manager.order === 'pre') {
        preList.push(manager)
      } else {
        postList.push(manager)
      }
    })

    const newWrapperList = [...preList, ...normalList, ...postList]
    console.log(newWrapperList[0].install);
    newWrapperList.forEach(manager => manager?.install())
  }

  public getPlugin<T extends typeof FeatureBase>(feature: T): InstanceType<T> | null {
    const name = feature.featureName;
    return this.managers.has(name) ? this.managers.get(name) as InstanceType<T> : null;
  }

  public dispose() {
    this.managers.forEach(manager => {
      manager.uninstall();
    })
    this.managers.clear()
  }
}

type zz = InstanceType<typeof FeatureBase>;