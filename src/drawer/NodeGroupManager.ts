/**
 * 维护分组下标
 */
export class NodeGroupManager {
  private nodeGroupMap: Map<string, number>;
  constructor() {
    this.nodeGroupMap = new Map();
  }

  updateNodeId(id: string): number {
    const currentNodeGroupId = this.getNodeGroupId(id);
    const newestNodeGroupId = currentNodeGroupId + 1;
    this.nodeGroupMap.set(id, newestNodeGroupId);
    return newestNodeGroupId;
  }

  setGroupId(id: string, groupNumber: number): void {
    const gN = this.getNodeGroupId(id);
    this.nodeGroupMap.set(id, Math.max(Number(groupNumber), gN));
  }

  getNodeGroupId(id: string): number {
    return this.nodeGroupMap.get(id) ?? 0;
  }

  dispose(): void {
    this.nodeGroupMap.clear();
  }

  reset(): void {
    Object.keys(this.nodeGroupMap).forEach((key) => {
      this.nodeGroupMap.set(key, 0)
    })
  }
}
