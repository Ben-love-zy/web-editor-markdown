
/*
 * @Description: ATX 标题识别，即#
 * @Author: ZengYong
 * @CreateDate: 2021-10-21 11:21:57
 */
import Creater, { ICreaterProps } from "./creater";
import { HeadNode } from "../node";
import { advanceOffset } from "../funs"
export class AtxHeadingCreater extends Creater {
  canCreate (task: ICreaterProps) {
    let createResult = null;
    const match = task.line.slice(task.offset).match(/^#{1,6}(?:[ \t]+)/);
    if (match) {
      const result = advanceOffset(task.line, task.offset, task.column, match[0].length);
      createResult = {
        offset: result.offset,
        column: result.column,
        spaceInTab: result.spaceInTab,
        mnode: new HeadNode(task.sourceStart, match[0].trim().length)
      }
    }
    return createResult;
  }
}
export default AtxHeadingCreater;