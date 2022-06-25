
import MNode, { NodeType } from "./node";
export class ImageNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = false;
  src: string;

  constructor (sourceStart: number, src: string) {
    super(sourceStart);
    this.type = NodeType.Image;
    this.src = src;
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
export default ImageNode;