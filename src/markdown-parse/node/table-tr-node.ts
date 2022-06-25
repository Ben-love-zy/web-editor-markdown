
import MNode, { NodeType } from "./node";
export class TableTrNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = true; // 不需要p标签
  readonly isParagraph = true;
  isheader: boolean = false;

  constructor (sourceStart: number, isheader: boolean = false) {
    super(sourceStart);
    this.type = NodeType.TableTr;
    this.isheader = isheader;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) {
    let continueResult: any = null;
    return continueResult;
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
export default TableTrNode;