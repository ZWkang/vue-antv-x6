import type { FeatureContext } from "../FeatureManager";



export abstract class AbstractFeatureBase {

  static featureName = ''
  static order: 'normal' | 'pre' | 'next' = 'normal' as const;

  get container() {
    return this.context.container;
  }

  get diagram() {
    return this.context.diagram;
  }

  constructor(public context: FeatureContext) {
    this.context = context;
  }

  abstract install(): void;
  abstract uninstall(): void;
}

export class FeatureBase extends AbstractFeatureBase {
  static featureName = 'FeatureBase';
  
  install(): void {
    throw new Error("Method not implemented.");
  }

  uninstall(): void {
    throw new Error("Method not implemented.");
  }
}