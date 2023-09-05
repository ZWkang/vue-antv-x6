import { FeatureBase } from "./FeatureBase";
import type { EventArgs, Graph } from '@antv/x6'
import { MiniMap } from '@antv/x6-plugin-minimap'

// 鼠标 hover 上去有个删除标记
export class MinimapFeature extends FeatureBase {
  static featureName = 'MinimapFeature';
  static order = 'pre' as const;


  private minimapContainer: HTMLElement | null = null;

  private initMinimapContainer() {
    this.minimapContainer = document.createElement('div');
    this.minimapContainer.style.position = 'absolute';
    this.minimapContainer.style.right = '10px';
    this.minimapContainer.style.bottom = '10px';

    this.container.diagram?.container.appendChild(this.minimapContainer);
  }


  install() {
    this.initMinimapContainer();
    this.diagram?.use(new MiniMap({
      container: this.minimapContainer!,
      width: 200,
      height: 200,
      padding: 10,
    }))
  }

  uninstall() {
    this.container.diagram?.container.removeChild(this.minimapContainer!);
  }
}