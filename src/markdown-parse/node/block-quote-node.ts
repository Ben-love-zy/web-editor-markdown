
import MNode, { NodeType } from "./node";
import { advanceOffset, isSpacerOrTab } from "../funs"
export class BlockQuoteNode extends MNode {

  readonly isContainer = true; // 是否可以包含其他node节点
  readonly isBlockContainer = true; // 块级元素中的容器块，可以继续包含块级元素，否则为叶子块，只能包含行级元素
  readonly canContainText = false; // 是否可以直接显示文本，不需要再嵌套p标签等
  readonly isParagraph = true; // 是否是段落block
  
  
  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.BlockQuote;
  }
    
  // @Override
  continue (currentLine: string, offset: number, column: number) {
    let continueResult: any = null;
    if (currentLine[offset] === '>') {
      let result = advanceOffset(currentLine, offset, column, 1);
      // if (isSpacerOrTab(currentLine[result.offset])) {
      //   result = advanceOffset(currentLine, result.offset, result.column, 1, true);
      // }
      continueResult = {
        offset: result.offset,
        column: result.column,
        spaceInTab: result.spaceInTab,
      };
    }
    return continueResult;
  }
    
  // @Override
  // finalize(sourceEnd?: number) {
  //   super.finalize(sourceEnd);
  // }
  
  // @Override
  canContain(mnode: MNode) {
    return mnode.type !== NodeType.Item;
  }
}
export default BlockQuoteNode;