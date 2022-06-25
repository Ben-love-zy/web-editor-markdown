
import MNode, { NodeType } from "./node";
export class UnderlineNode extends MNode {
   
  readonly isContainer = false;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = false;


  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.Underline;
  }

  // @Override
  // continue () { 
  //   return true;
  // }
    
  // @Override
  // finalize() {
    
  // }
  
  // @Override
  // canContain(mnode: MNode) {
  //   return false;
  // }
}
export default UnderlineNode;