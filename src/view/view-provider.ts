/*
 * @Description: 统一创建视图类
 * @Author: ZengYong
 * @CreateDate: 2021-09-18 17:33:09
 */
import PreviewView from "./preview-view";
import RenderView from "./render-view";
import SourceAndPreviewView from "./source-and-preview-view";
import SourceView from "./source-view";
import { TextModel, SelectionModel } from "../model/";

export enum ViewMode {
  PREVIEW, // 预览-只读模式
  RENDER, // 实时渲染模式
  SOURCE, // 源码模式
  SOURCE_AND_PREVIEW // 双屏模式
};

export type View = PreviewView | RenderView | SourceAndPreviewView | SourceView;

export class ViewProvider {

  provide (viewMode: ViewMode, textModel: TextModel, selectionModel: SelectionModel, viewContainer: HTMLElement): View {
    switch (viewMode) {
      case ViewMode.PREVIEW:
        return new PreviewView(textModel, selectionModel, viewContainer);
      case ViewMode.RENDER:
        return new RenderView(textModel, selectionModel, viewContainer);
      case ViewMode.SOURCE:
        return new SourceView(textModel, selectionModel, viewContainer);
      case ViewMode.SOURCE_AND_PREVIEW:
        return new SourceAndPreviewView(textModel, selectionModel, viewContainer);
      default:
        return new PreviewView(textModel, selectionModel, viewContainer);
    }
  }
}
 export default ViewProvider;