
/*
 * @Description: 分割线
 * @Author: ZengYong
 * @CreateDate: 2021-10-22 17:46:37
 */
import MNode, { NodeType } from "./node";
export class ThematicBreakNode extends MNode {

  readonly isContainer = false;
  readonly isBlockContainer = false;
  readonly canContainText = true; // 不需要创建p标签，因为没有内容
  readonly isParagraph = true;

  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.ThematicBreak;
  }

  continue (currentLine: string, offset: number, column: number) { 
    return null;
  }

  // finalize() {
  //   super.finalize();
  // }

  canContain(mnode: MNode) {
    return false;
  }
}
export default ThematicBreakNode;