
import MNode, { NodeType } from "./node";
export class DelNode extends MNode {
   
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = false;


  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.Del;
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
export default DelNode;