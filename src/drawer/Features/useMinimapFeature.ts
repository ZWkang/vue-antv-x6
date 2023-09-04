import { FeatureBase } from "./FeatureBase";
import type { EventArgs, Graph } from '@antv/x6'

// 鼠标 hover 上去有个删除标记
export class MinimapFeature extends FeatureBase {
  static featureName = 'MinimapFeature';
  static order = 'pre' as const;

  private handleEnterEvent({ cell }: EventArgs['cell:mouseenter']) {
    if(!cell.isNode()) return;
    cell.addTools([
      {
        name: 'button-remove',
        args: {
          // 右上角
          x: '100%',
          y: 0,
          offset: { x: 0, y: 0 },
        }
      }
    ])
  }

  private handleLeaveEvent({ cell }: EventArgs['cell:mouseleave']) {
    cell.removeTool('button-remove')
  }

  install() {
    this.diagram!.on('cell:mouseenter', this.handleEnterEvent)
    this.diagram!.on('cell:mouseleave', this.handleLeaveEvent)
  }

  uninstall() {
    this.diagram!.off('cell:mouseenter', this.handleEnterEvent)
    this.diagram!.off('cell:mouseleave', this.handleLeaveEvent)
  }
}