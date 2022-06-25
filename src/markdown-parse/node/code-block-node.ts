
import MNode, { NodeType } from "./node";
import { advanceOffset } from "../funs"
export class CodeBlockNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = true; // 是否是段落block
  lang: string;
  char: string = '```'
  

  constructor (sourceStart: number, lang: string, char: string) {
    super(sourceStart);
    this.type = NodeType.CodeBlock;
    this.lang = lang;
    this.char = char;
    this.blockMarkerBefore = char;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) {
    let continueResult: any = null;
    // const match = currentLine.slice(offset).match(/^(?:`{3,}|~{3,})(?= *$)/);
    const str = currentLine.slice(offset);
    if (str === '```' || str === '~~~') { // 代码块结束
      this.blockMarkerAfter = this.blockMarkerBefore;
      const result = advanceOffset(currentLine, offset, column, 3);
      continueResult = {
        end: true,
        offset: result.offset,
        column: result.column,
        spaceInTab: result.spaceInTab,
      };
    } else {
      continueResult = { offset: -1, column: -1, spaceInTab: -1 };
    }
    return continueResult;
  }
    
  // @Override
  // finalize(sourceEnd?: number) {
  //   super.finalize(sourceEnd);
  // }
  
  // @Override
  canContain(mnode: MNode) {
    return false;
  }
}
export default CodeBlockNode;