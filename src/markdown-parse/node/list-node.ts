
import MNode, { NodeType } from "./node";
export class ListNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = true;
  readonly canContainText = false;
  readonly isParagraph = true;
  column: number = 0;
  start: string = '1'; // 有序列表开始的序号
  listType: string = 'bullet'; // bullet 或 ordered
  bulletChar: string = '-'; // - 或者 * 或者 _
  delimiter: string = '.'; // . 或者 )

  constructor (sourceStart: number, listType: string, bulletChar: string, delimiter: string, column: number, start: string) {
    super(sourceStart);
    this.type = NodeType.List;
    this.column = column;
    this.listType = listType;
    this.bulletChar = bulletChar;
    this.delimiter = delimiter;
    this.start = start;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) {
    let continueResult: any = null;
    // 如果上一行是空白行，则退出当前列表
    // let notBlankLine = '';
    // let lastChild = this.lastChild;
    // while (lastChild) {
    //   notBlankLine = lastChild.stringContent;
    //   lastChild = lastChild.lastChild;
    // }
    // if (notBlankLine) {
      continueResult = { offset: -1, column: -1, spaceInTab: -1 };
    // }
    return continueResult;
  }
    
  // @Override
  // finalize() {
  //   super.finalize();
  // }

  // @Override
  canContain(mnode: MNode) {
    return mnode.type === NodeType.Item;
  }
}
export default ListNode;