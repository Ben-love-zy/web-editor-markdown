/*
 * @Description: 分屏模式或源码-预览模式（编辑模式）
 * @Author: ZengYong
 * @CreateDate: 2021-09-18 16:39:41
 */
import BaseView, { IDomPoint } from "./base-view";
import { TextModel, SelectionModel, SelectionCustom } from "../model/";
import markdown from "../markdown-parse"
import { escapeXml } from '../markdown-parse/funs';

class SourceAndPreviewView extends BaseView {
  private previewElement_: HTMLElement | null;
  private sourceAndPreviewRenderBinder_: any;

  constructor (textModel: TextModel, selectionModel: SelectionModel, viewContainer: HTMLElement) {
    super(textModel, selectionModel, viewContainer);
    const previewElement = document.createElement("pre");
    // previewElement.setAttribute("spellcheck", "false");
    // previewElement.setAttribute("style", "width: 50%; background-color: #fafbfc;border-left: 2px solid #ddd");
    previewElement.setAttribute("class", "editor-pre preview");
    this.viewContainer_.parentElement?.appendChild(previewElement);
    this.previewElement_ = previewElement;
  }

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

  showMarker () {
    
  }
  
  /** @override */
  render () {
    this.viewContainer_.innerHTML = escapeXml(this.textModel_.getSpacer()) + '\n';
    this.updateDomSelection();
    if (this.previewElement_) {
      this.previewElement_.innerHTML = markdown.md2html(this.textModel_.getSpacer());
      // this.viewContainer_.scrollTop = this.viewContainer_.scrollHeight;
    }
  }

  dispose () {
    super.dispose();
    if (this.sourceAndPreviewRenderBinder_) {
      this.textModel_.off(TextModel.EVENT_TYPE.TEXT_CHANGE, this.sourceAndPreviewRenderBinder_);
      this.sourceAndPreviewRenderBinder_ = null;
    }
    if (this.previewElement_) {
      this.previewElement_.remove();
      this.previewElement_ = null;
    }
  }
}
export default SourceAndPreviewView;