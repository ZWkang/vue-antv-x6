import { Dnd } from '@antv/x6-plugin-dnd'


import { FeatureBase } from "./FeatureBase";
import type { Edge, EventArgs, Graph } from '@antv/x6'
import { Events } from '@antv/x6' 
import { MiniMap } from '@antv/x6-plugin-minimap'


// 删除线段的 feature
export class DragAnchorFeature extends FeatureBase {
  static featureName = 'DragAnchorFeature';
  static order = 'pre' as const;

  private templateDraggingNode: any = null;
  
  constructor(props: any) {
    super(props);
  }

  
  

  install() {
  }

  uninstall() {
  }
}