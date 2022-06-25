
import MNode, { NodeType } from "./node";
export class TableNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = true;
  readonly canContainText = false;
  readonly isParagraph = true;
  aligns: string[] = [];

  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.Table;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) {
    let continueResult: any = null;
    if (currentLine.length) {
      continueResult = { offset: -1, column: -1, spaceInTab: -1 };
    }
    return continueResult;
    
  }
    
  // @Override
  // finalize() {
  //   super.finalize();
  // }

  // @Override
  canContain(mnode: MNode) {
    return mnode.type === NodeType.TableThead || mnode.type === NodeType.TableTbody
  }
}
export default TableNode;