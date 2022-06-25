/*
 * @Description: setext标题识别，即横杠
 * @Author: ZengYong
 * @CreateDate: 2021-10-21 11:21:57
 */

import Creater, { ICreaterProps } from "./creater";
export class SetextHeadingCreater extends Creater {
  canCreate (task: ICreaterProps) {
    return null; // 暂时不支持
  }
}
export default SetextHeadingCreater;