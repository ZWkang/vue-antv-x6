import { FeatureBase } from "./FeatureBase";
import { Options } from '@antv/x6/lib/graph/options';

import { pick } from 'lodash-es'


export class RuleFeature extends FeatureBase {
  static featureName = 'RuleFeature';


  private localSnapshot: Partial<Options.Connecting> = {};

  get options() {
    return this.container.diagram!.options;
  }


  snapshotOptions() {
    this.localSnapshot = {
      ...this.options.connecting,
    }
  }

  restoreOptions() {
    const snapshotRecover = pick(this.localSnapshot, ['snap', 'allowBlank', 'allowLoop', 'allowNode', 'allowMulti', 'allowEdge']);
    this.options.connecting = {
      ...this.options.connecting,
      ...snapshotRecover
    }
  }

  setupRule() {


    this.options.connecting.snap = true;
    this.options.connecting.allowBlank = false;
    this.options.connecting.allowLoop = false;
    this.options.connecting.allowNode = false;
    this.options.connecting.allowMulti = 'withPort';
    this.options.connecting.allowEdge = false;
  }

  uninstall() {
    this.restoreOptions();
  }
  install() {
    this.setupRule();
  }
}