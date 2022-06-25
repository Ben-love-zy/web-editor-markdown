
import MNode, { NodeType } from "./node";
export class LinkNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = false;
  href: string;

  constructor (sourceStart: number, href: string) {
    super(sourceStart);
    this.type = NodeType.Link;
    this.href = href;
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
export default LinkNode;