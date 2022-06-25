/*
 * @Description: 设置选区 OP
 * @Author: ZengYong
 * @CreateDate: 2021-09-17 19:16:22
 */
import Operation from "./operation";
import Editor from "../editor";
import { SelectionCustom } from "../model/selection-model";

export class SetSelectionOperation extends Operation {

  protected selection_: SelectionCustom | null;
  protected oldSelection_: SelectionCustom;

  constructor (selection: SelectionCustom | null) {
    super();
    this.selection_ = selection;
  }

  /** 合并两个选区op */
  static merge (firstOp: SetSelectionOperation, secondOp: SetSelectionOperation) {
    const newSelection = new SetSelectionOperation(secondOp.getSelection());
    newSelection.setOldSelection(firstOp.getOldSelection());
    return newSelection;
  }

  apply (editor: Editor) {
    this.setOldSelection(editor.getSelectionModel().getSelection());
    editor.getSelectionModel().setSelection(this.selection_);
  }

  inverse () {
    return new SetSelectionOperation(this.oldSelection_);
  }

  getSelection () {
    return this.selection_;
  }

  getOldSelection () {
    return this.oldSelection_;
  }

  setOldSelection (oldSelection: SelectionCustom) {
    this.oldSelection_ = oldSelection;
  }
}
export default SetSelectionOperation;