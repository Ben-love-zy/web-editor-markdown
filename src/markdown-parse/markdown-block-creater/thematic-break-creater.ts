/*
 * @Description: 分割线识别（---或___或***）
 * @Author: ZengYong
 * @CreateDate: 2021-10-21 11:21:57
 */

import Creater, { ICreaterProps } from "./creater";
import { ThematicBreakNode } from "../node";
import { advanceOffset } from "../funs"
export class ThematicBreakCreater extends Creater {
  canCreate (task: ICreaterProps) {
    let createResult = null;
    let lineRest = task.line.slice(task.offset).replace(/\s/g, '');
    if (this.maybeThematicBreak_(lineRest, task.nextLine)) {
      const match = lineRest.match(/^(?:\*){3,}$|^(?:_){3,}$|^(?:-){3,}$/);
      if (match) {
        const result = advanceOffset(task.line, task.offset, task.column, task.line.length - task.offset);
        createResult = {
          offset: result.offset,
          column: result.column,
          spaceInTab: result.spaceInTab,
          mnode: new ThematicBreakNode(task.sourceStart)
        };
      }
    }
    return createResult;
    
  }

  maybeThematicBreak_ (currentLine: string, nextLine: string | undefined) {
    return nextLine === undefined ? false : true;
  }
}
export default ThematicBreakCreater;