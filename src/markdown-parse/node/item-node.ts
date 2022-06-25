
import MNode, { NodeType } from "./node";
import { advanceOffset, isSpacerOrTab } from "../funs"

export class ItemNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = true;
  readonly canContainText = false; // 中间可能嵌入子列表，因此先取消其直接接收文本的能力，不然子列表和文本不能按顺序平级解析
  readonly isParagraph = true;
  column: number = 0; // 行首缩进
  listType: string = 'bullet'; // bullet 或 ordered
  bulletChar: string = '-'; // - 或者 * 或者 _
  delimiter: string = '.'; // . 或者 )
  listStyle: string = '';

  constructor (sourceStart: number, listType: string, bulletChar: string, delimiter: string, column: number) {
    super(sourceStart);
    this.type = NodeType.Item;
    this.column = column;
    this.listType = listType;
    this.bulletChar = bulletChar;
    this.delimiter = delimiter;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) {
    if (currentLine === '') {
      return null;
    }
    let continueResult: any = null;
    // let offsetTemp = offset;
    // while (isSpacerOrTab(currentLine[offsetTemp])) {
    //   offsetTemp++;
    // }
    // const currentLineText = currentLine.slice(offsetTemp);
    // let match = currentLineText.match(/^[*+-]\s/) || currentLineText.match(/^(\d{1,9})[.)]\s/);
    // 如果上一行是空白行，则退出当前列表
    // let notBlankLine = '';
    // let lastChild = this.lastChild;
    // while (lastChild) {
    //   notBlankLine = lastChild.stringContent;
    //   lastChild = lastChild.lastChild;
    // }
    // if (notBlankLine) {
    //   if (!match || (match && indent - 2 >= this.indent)) {
    //     // 这里不能更新pos，否则 indent 会失效
    //     // const result = advanceOffset(currentLine, offset, column, 2, true);
    //     // continueResult = { offset: result.offset, column: result.column, spaceInTab: -1 };
    //     continueResult = { offset: -1, column: -1, spaceInTab: -1 };
    //   }
    // }

    if (column - 2 >= this.column) {
      continueResult = { offset, column, spaceInTab: -1 };
    }
    return continueResult
  }
    
  // @Override
  // finalize() {
  //   super.finalize();
  // }
 
  // @Override
  canContain(mnode: MNode) {
    return mnode.type !== NodeType.Item;
  }
}
export default ItemNode;