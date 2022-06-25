
/*
 * @Description: 文本节点，也是实际情况生成最多的节点
 * @Author: ZengYong
 * @CreateDate: 2021-10-22 17:46:04
 */
import MNode, { NodeType } from "./node";
export class CheckboxNode extends MNode {

  readonly isContainer = false;
  readonly isBlockContainer = false;
  readonly canContainText = false;
  readonly isParagraph = false;
  checked: boolean = false;

  constructor (sourceStart: number, checked: boolean = false) {
    super(sourceStart);
    this.type = NodeType.Checkbox;
    this.checked = checked;
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
export default CheckboxNode;