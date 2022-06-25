
/*
 * @Description: 段落节点。即对应 p 标签
 * @Author: ZengYong
 * @CreateDate: 2021-10-22 17:48:12
 */

import MNode, { NodeType } from "./node";
export class ParagraphNode extends MNode {
  
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = true;
  

  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.Paragraph;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) { 
    return null;
  }
  
  // @Override
  finalize(sourceEnd?: number) {
    super.finalize(sourceEnd);
    // TODO 引用链接 map 解析
  }
  
  // @Override
  canContain(mnode: MNode) {
    return false;
  }
}
export default ParagraphNode;