
/*
 * @Description: 加粗节点
 * @Author: ZengYong
 * @CreateDate: 2021-10-22 17:47:48
 */
import MNode, { NodeType } from "./node";
export class StrongNode extends MNode {
  
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = false;

  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.Strong;
  }

  // @Override
  // continue () { 
  //   return false;
  // }
    
  // @Override
  // finalize() {
    
  // }

  // @Override
  // canContain(mnode: MNode) {
  //   return false;
  // }
}
export default StrongNode;