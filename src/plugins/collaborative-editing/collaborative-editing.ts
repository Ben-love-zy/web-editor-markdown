
/*
 * @Description: 协同编辑扩展
 * @Author: ZengYong
 * @CreateDate: 2022-10-30 19:09:40
 */
import { Editor, Operation } from "../../index"
import { CollaborativeEditor } from "./collaborative-editing-editor";

export const withCollaborative = <T extends Editor>(editor: T) => {
  
  const collaborativeEditor = editor as T & CollaborativeEditor;
  const apply = editor.apply.bind(editor);

  collaborativeEditor.apply = (op: Operation) => {
    apply(op);
  }

  return collaborativeEditor;
}