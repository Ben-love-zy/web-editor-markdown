/*
 * @Description: 所见即所得模式（编辑模式）视图
 * @Author: ZengYong
 * @CreateDate: 2021-09-18 16:39:41
 */
import BaseView from "./base-view";
import { TextModel, SelectionModel, SelectionCustom } from "../model/";

class RenderView extends BaseView {

  /** @override 将选区模型转换成 Dom 的真实选区 */
  customSelToDomSel (customSelection: SelectionCustom) {
    return super.customSelToDomSel(customSelection);
  }

  /** @override 将 Dom 真实选区转换成选区模型 */
  domSelToCustomSel (domSelection: Selection) {
    return super.domSelToCustomSel(domSelection);
  }

  /** @override */
  render () {
    super.render();
  }
}
export default RenderView;