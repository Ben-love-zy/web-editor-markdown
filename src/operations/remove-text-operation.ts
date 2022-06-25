/*
 * @Description: 删除字符串 OP
 * @Author: ZengYong
 * @CreateDate: 2021-09-17 19:16:07
 */
import Operation from "./operation";
import Editor from "../editor";
import InsertTextOperation from "./insert-text-operation";

export class RemoveTextOperation extends Operation {

  protected startIndex_: number;
  protected endIndex_: number;
  protected removeText_: string;

  constructor (startIndex_: number, endIndex_: number) {
    super();
    this.startIndex_ = startIndex_;
    this.endIndex_ = endIndex_;
  }

  apply (editor: Editor) {
    this.removeText_ = editor.getTextModel().remove(this.startIndex_, this.endIndex_);
  }

  inverse () {
    return new InsertTextOperation(this.removeText_, this.startIndex_);
  }

  getStartIndex () {
    return this.startIndex_;
  }

  getEndIndex () {
    return this.endIndex_;
  }
}
export default RemoveTextOperation;