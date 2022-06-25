
import MNode, { NodeType } from "./node";
export class DocumentNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = false;
  readonly isParagraph = true;
  

  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.Document;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) { 
    return { offset: -1, column: -1, spaceInTab: -1 };
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
export default DocumentNode;