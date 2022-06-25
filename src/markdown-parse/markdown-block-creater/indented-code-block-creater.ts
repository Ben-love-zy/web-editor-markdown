/*
 * @Description: 通过4个空格或者缩进触发的代码块
 * @Author: ZengYong
 * @CreateDate: 2021-10-21 11:21:57
 */

import Creater, { ICreaterProps } from "./creater";
export class IndentedCodeBlockCreater extends Creater {
  canCreate (task: ICreaterProps) {
    return null; // 暂时不支持
  }
}
export default IndentedCodeBlockCreater;