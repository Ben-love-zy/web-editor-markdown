
/*
 * @Description: 文本节点，也是实际情况生成最多的节点
 * @Author: ZengYong
 * @CreateDate: 2021-10-22 17:46:04
 */
import MNode, { NodeType } from "./node";
export class TextNode extends MNode {

  readonly isContainer = false;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = false;
  text: string;

  constructor (sourceStart: number, text: string) {
    super(sourceStart);
    this.type = NodeType.Text;
    this.text = text;
    this.sourceEnd = sourceStart + text.length;
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
export default TextNode;