
/*
 * @Description: 文本节点，也是实际情况生成最多的节点
 * @Author: ZengYong
 * @CreateDate: 2021-10-22 17:46:04
 */
import MNode, { NodeType } from "./node";
export class HtmlBlockNode extends MNode {

  readonly isContainer = false;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = true;
  htmlContent: string = '';
  isCloseTag: boolean;

  constructor (sourceStart: number, htmlContent: string, isCloseTag: boolean) {
    super(sourceStart);
    this.type = NodeType.HtmlBlock;
    this.htmlContent = htmlContent;
    this.isCloseTag = isCloseTag;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) { 
    return { offset: -1, column: -1, spaceInTab: -1};;
  }

  // @Override
  // finalize() {
  //   super.finalize();
  // }

  // @Override
  canContain(mnode: MNode) {
    return false;
  }
}
export default HtmlBlockNode;