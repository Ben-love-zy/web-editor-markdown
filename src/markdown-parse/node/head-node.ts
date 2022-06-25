
import MNode, { NodeType } from "./node";
export class HeadNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = false;
  readonly canContainText = true;
  readonly isParagraph = true;
  level: number = 1;

  constructor (sourceStart: number, level: number) {
    super(sourceStart);
    this.type = NodeType.Head;
    this.level = level;
    this.blockMarkerBefore = '#'.repeat(level) + ' ';
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) { 
    return null;
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
export default HeadNode;