/*
 * @Description: html识别
 * @Author: ZengYong
 * @CreateDate: 2021-10-21 11:21:57
 */
import Creater, { ICreaterProps } from "./creater";
export class HtmlBlockCreater extends Creater {
  canCreate (task: ICreaterProps) {
    return null; // 暂时不支持
  }
}
export default HtmlBlockCreater;