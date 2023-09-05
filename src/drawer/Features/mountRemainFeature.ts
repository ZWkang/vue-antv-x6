import { FeatureBase } from "./FeatureBase";
import type { EventArgs, Graph } from '@antv/x6'
import { MiniMap } from '@antv/x6-plugin-minimap'

// 鼠标 hover 上去有个删除标记
export class MountedRemainFeature extends FeatureBase {
  static featureName = 'MountedRemainFeature';
  static order = 'pre' as const;

  private count = 0;

  private handleMountedLog() {
    console.log(`mounted`)
  }

  private handleUnmountedLog() {
    this.count += 1;
    console.log(`unmounted`)
  }


  install() {
    this.container.on('mounted', this.handleMountedLog)
    this.container.on('unmounted', this.handleUnmountedLog)
  }

  uninstall() {
    this.container.off('mounted', this.handleMountedLog)
    if(this.count >= 1) {
      this.container.off('unmounted', this.handleUnmountedLog)
    }
  }
}