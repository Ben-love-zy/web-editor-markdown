
/*
 * @Description: 行内代码
 * @Author: ZengYong
 * @CreateDate: 2021-11-19 15:52:14
 */
import MNode, { NodeType } from "./node";
export class CodeNode extends MNode {
    
  readonly isContainer = false;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = false; // 是否是段落block
  content: string = '';
  

  constructor (sourceStart: number, content: string) {
    super(sourceStart);
    this.type = NodeType.Code;
    this.content = content;
  }

  
}
export default CodeNode;