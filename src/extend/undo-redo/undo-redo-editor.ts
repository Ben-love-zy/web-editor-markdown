/*
 * @Description: 撤销回退以扩展方式添加
 * @Author: ZengYong
 * @CreateDate: 2021-11-17 12:20:04
 */
import { Operation } from "../../";

export interface History {
  redos: Operation[][]
  undos: Operation[][]
}

export class UndoRedoEditor {
  history: History;
  operations: Operation[];
  undo: () => void;
  redo: () => void;
}
export default UndoRedoEditor;