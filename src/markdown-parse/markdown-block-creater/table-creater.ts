
/*
 * @Description: 表格识别并创建
 * @Author: ZengYong
 * @CreateDate: 2021-11-09 20:54:07
 */
import { NodeType, TableNode, TableTbodyNode, TableTheadNode, TableTrNode } from "../node";
import Creater, { ICreaterProps } from "./creater";
import { advanceOffset, getPreSpacerOrTab } from "../funs"
export class TableCreater extends Creater {
  canCreate (task: ICreaterProps) {
    let createResult = null;
    let lineRest = task.line.slice(task.offset);
    if (lineRest) {
      const containerType = task.container.type;
      let mnnode;
      if (containerType === NodeType.Table) {
        const tableTbodyNode = new TableTbodyNode(task.sourceStart);
        const tableTrNode = new TableTrNode(task.sourceStart);
        tableTrNode.stringContent = lineRest;
        tableTbodyNode.appendChild(tableTrNode);
        mnnode = tableTbodyNode;
      } else if (containerType === NodeType.TableTbody) {
        const tableTrNode = new TableTrNode(task.sourceStart);
        tableTrNode.stringContent = lineRest;
        mnnode = tableTrNode;
      } else if (this.maybeTable_(lineRest, task.nextLine)) {
        const tableNode = new TableNode(task.sourceStart);
        const tableTheadNode = new TableTheadNode(task.sourceStart);
        const tableTrNode = new TableTrNode(task.sourceStart, true);
        tableTrNode.stringContent = lineRest;
        tableTheadNode.appendChild(tableTrNode);
        tableNode.appendChild(tableTheadNode);
        mnnode = tableNode;
      }
      if (mnnode) {
        const result = advanceOffset(task.line, task.offset, task.column, lineRest.length);
        createResult = {
          offset: result.offset,
          column: result.column,
          spaceInTab: result.spaceInTab,
          mnode: mnnode
        }
      }
    }
		return createResult;
  }

  maybeTable_ (currentLine: string, nextLine: string | undefined) {
    currentLine = currentLine.replace(/\\\|/g, '**'); // \| 表示转义了，不参与表格判断
    if (currentLine && currentLine.indexOf('|') > -1 && currentLine.indexOf('- ') !== 0 && nextLine) {
      // nextLine = nextLine.replace(/\s/g, '');
      // 去掉前面空格
      const preSpacerOrTab = getPreSpacerOrTab(nextLine);
      if (preSpacerOrTab) {
        nextLine = nextLine.slice(preSpacerOrTab.length);
      }
      if (nextLine[0] != '|') {
        nextLine = '|' + nextLine;
      }
      if (nextLine.match(/^(\|\s*:?-+:?\s*)+\|?$/)) {
        if (currentLine[0] === '|') {
          currentLine = currentLine.slice(1);
        }
        if (currentLine[currentLine.length - 1] === '|') {
          currentLine = currentLine.slice(0, -1);
        }
        if (nextLine[0] === '|') {
          nextLine = nextLine.slice(1);
        }
        if (nextLine[nextLine.length - 1] === '|') {
          nextLine = nextLine.slice(0, -1);
        }
        const firstNum = currentLine.split('|').length;
        const nextNum = nextLine.split('|').length;
        if (firstNum === nextNum) {
          return true;
        }
      }
    }
    return false;
  }
}
export default TableCreater;