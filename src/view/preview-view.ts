/*
 * @Description: 预览模式（只读模式）视图
 * @Author: ZengYong
 * @CreateDate: 2021-09-18 16:39:41
 */
import { TextModel, SelectionModel, SelectionCustom } from "../model/";
import BaseView from "./base-view";
import markdown from "../markdown-parse"

class PreviewView extends BaseView {

  constructor (textModel: TextModel, selectionModel: SelectionModel, viewContainer: HTMLElement) {
    super(textModel, selectionModel, viewContainer);
    this.viewContainer_.setAttribute('contenteditable', 'false');
  }

  addListeners () {

  }
  
  /** @override */
  render () {
    this.viewContainer_.innerHTML = markdown.md2html(this.textModel_.getSpacer())
  }
}
export default PreviewView;