/*
 * @Description: 源码模式（编辑模式）视图
 * @Author: ZengYong
 * @CreateDate: 2021-09-18 16:39:41
 */
import BaseView, { IDomPoint } from "./base-view";
import { TextModel, SelectionModel, SelectionCustom } from "../model/";
import { escapeXml } from '../markdown-parse/funs';

class SourceView extends BaseView {

  customPointToDomPoint (customPoint: number) {
    let domPoint = {
      domNode: this.viewContainer_,
      domOffset: 0
    }
    if (this.viewContainer_.childNodes.length) {
      domPoint = {
        domNode: this.viewContainer_.childNodes[0] as HTMLElement,
        domOffset: customPoint
      }
    }
    return domPoint;
  }

  domPointToCustomPoint (domPoint: IDomPoint) {
    return domPoint.domOffset;
  }

  /** @override */
  render () {
    this.viewContainer_.innerHTML = escapeXml(this.textModel_.getSpacer())+'\n'; // 换行符是解决换行时不光标不跟随的问题
    this.updateDomSelection();
    // this.viewContainer_.scrollTop = this.viewContainer_.scrollHeight;
  }
}
export default SourceView;