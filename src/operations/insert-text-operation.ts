/*
 * @Description: 插入字符串 OP，所有 OP 主要操作数据模型
 * @Author: ZengYong
 * @CreateDate: 2021-09-17 19:15:18
 */
import Operation from "./operation";
import Editor from "../editor";
import RemoveTextOperation from "./remove-text-operation";

export class InsertTextOperation extends Operation{

  protected spacers_: string;
  protected insertIndex_: number;

  constructor (spacers: string, insertIndex: number) {
    super();
    this.spacers_ = spacers;
    this.insertIndex_ = insertIndex;
  }

  apply (editor: Editor) {
    editor.getTextModel().insert(this.insertIndex_, this.spacers_);
  }

  inverse () {
    return new RemoveTextOperation(this.insertIndex_, this.insertIndex_ + this.spacers_.length);
  }

  getSapcers () {
    return this.spacers_;
  }

  getInsertIndex_ () {
    return this.insertIndex_;
  }
}
 export default InsertTextOperation;