
import MNode, { NodeType } from "./node";
export class TableTbodyNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = true;
  readonly canContainText = false;
  readonly isParagraph = true;

  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.TableTbody;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) {
    let continueResult: any = null;
    continueResult = { offset: -1, column: -1, spaceInTab: -1 };
    return continueResult;
  }
    
  // @Override
  // finalize() {
  //   super.finalize();
  // }

  // @Override
  canContain(mnode: MNode) {
    return mnode.type === NodeType.TableTr;
  }
}
export default TableTbodyNode;