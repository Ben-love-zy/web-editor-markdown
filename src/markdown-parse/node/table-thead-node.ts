
import { TableNode } from ".";
import { advanceOffset } from "../funs";
import MNode, { NodeType } from "./node";
export class TableTheadNode extends MNode {
    
  readonly isContainer = true;
  readonly isBlockContainer = true;
  readonly canContainText = false;
  readonly isParagraph = true;

  constructor (sourceStart: number) {
    super(sourceStart);
    this.type = NodeType.TableThead;
  }

  // @Override
  continue (currentLine: string, offset: number, column: number) {
    let continueResult: any = null;
    let lineRest = currentLine.slice(offset);
    const tds = lineRest.replace(/\s/g, '').split('|');
    let tableNode = this.parent as TableNode;
    for (let td of tds) {
      if (td) {
        const alignLeft = td[0] === ':';
        const alignRight = td[td.length - 1] === ':';
        let align = 'left';
        // left 为默认值，减少其判断
        if (alignLeft && alignRight) {
          align = 'center';
        } else if (!alignLeft && alignRight) {
          align = 'right';
        }
        tableNode.aligns.push(align);
      }
    }
    const result = advanceOffset(currentLine, offset, column, lineRest.length);
    continueResult = {
      end: true,
      offset: result.offset,
      column: result.column,
      spaceInTab: result.spaceInTab,
    };
    return continueResult;
  }
    
  // @Override
  // finalize() {
  //   super.finalize();
  // }

  // @Override
  canContain(mnode: MNode) {
    return false; // 已经和table打包创建了，不存在新包含的情况了
    // return mnode.type === NodeType.TableTr;
  }
}
export default TableTheadNode;