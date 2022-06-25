
import MNode, { NodeType } from "./node";
export class EmphNode extends MNode {
   
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = false;


  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.Emph;
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
export default EmphNode;