// import { Editor } from "..";
import BaseEventHandler from "./base-event";
import { SelectionCustom } from "../model/selection-model";
import { BaseView } from '../view'
/*
 * @Description: 模型层的自定义事件，如 dom 选区变化后，需先经过模型层处理。
 * @Author: ZengYong
 * @CreateDate: 2021-09-29 16:01:46
 */
export class ViewEventHandler extends BaseEventHandler{

  private selectionchangeHandlerBinder_: any;
  // constructor (editor: Editor) {
  //   super(editor);
  // }

  selectionchangeHandler_ (selection: SelectionCustom | null) {
    if (this.getComposing()) { // 中文输入状态不用更新选区
      return;
    }
    if (selection) {
      this.editor.setSelection(selection.anchor, selection.focus);
    } else {
      this.editor.removeSelection();
    }
  }

  addListeners () {
    super.addListeners();
    this.selectionchangeHandlerBinder_ = this.selectionchangeHandler_.bind(this);
    this.view.on(BaseView.EVENT_TYPE.SELECTION_CHANGE, this.selectionchangeHandlerBinder_);
  }

  dispose () {
    super.dispose();
    this.view.off(BaseView.EVENT_TYPE.SELECTION_CHANGE, this.selectionchangeHandlerBinder_);
  }
}
export default ViewEventHandler;