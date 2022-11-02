
/*
 * @Description: 撤销回退扩展
 * @Author: ZengYong
 * @CreateDate: 2021-09-17 19:17:45
 */
import { Editor, Operation, SetSelectionOperation, RemoveTextOperation, InsertTextOperation } from "../../index"
import { UndoRedoEditor, History } from "./undo-redo-editor";
import { debounce } from '../../utils/debounce'



export const withUndoRedo = <T extends Editor>(editor: T) => {
  
  const undoRedoEditor = editor as T & UndoRedoEditor;
  const apply = editor.apply.bind(editor);
  const clearContent = editor.clearContent.bind(editor);
  const setContent = editor.setContent.bind(editor);

  undoRedoEditor.history = { undos: [], redos: [] };
  undoRedoEditor.operations = [];

  undoRedoEditor.redo = () => {
    const { history } = undoRedoEditor;
    const { redos } = history;

    if (redos.length > 0) {
      const batch = redos.pop() as Operation[];

      for (const op of batch) {
        apply(op);
      }

      // history.redos.pop();
      history.undos.push(batch);
    }
  }

  undoRedoEditor.undo = () => {
    const { history } = undoRedoEditor;
    const { undos } = history;

    if (undos.length > 0) {
      const batch = undos.pop() as Operation[];
      const inverseOps = batch.map((op) => {
        return op.inverse();
      }).reverse();
      for (const op of inverseOps) {
        apply(op);
      }

      history.redos.push(batch);
      // history.undos.pop();
    }
  }

  undoRedoEditor.apply = (op: Operation) => {
    const { operations, history } = undoRedoEditor;
    // const { undos } = history;

    // const lastBatch = undos[undos.length - 1];
    // const lastOp = lastBatch && lastBatch[lastBatch.length - 1];
    // const merge = shouldMerge(op, lastOp);
    // const overwrite = shouldOverwrite(op, lastOp)

    // if (lastBatch && merge) {
    //   if (overwrite) {
    //     lastBatch.pop()
    //   }
    //   lastBatch.push(op);
    // } else {
    //   undos.push([op]);
    // }

    // // TODO 可以考虑放异步
    // while (undos.length > 100) {
    //   undos.shift();
    // }
    // if (shouldClear(op)) {
    //   history.redos = [];
    // }
    apply(op);
    operations.push(op);
    addHistory(operations, history);
  }

  undoRedoEditor.clearContent = () => {
    const { history } = undoRedoEditor;
    clearContent();
    setTimeout(() => {
      history.undos = [];
      history.redos = [];
    }, 300);
   
  }

  undoRedoEditor.setContent = (content: string) => {
    const { history } = undoRedoEditor;
    setContent(content);
    setTimeout(() => {
      history.undos = [];
      history.redos = [];
    }, 300);
  }

  return undoRedoEditor;
}


const shouldMerge = (op: Operation, prev: Operation | undefined): boolean => {
  if (op instanceof SetSelectionOperation) {
    return true
  }

  // if (
  //   prev &&
  //   op instanceof InsertTextOperation &&
  //   prev instanceof InsertTextOperation &&
  //   op.getInsertIndex_() === prev.getInsertIndex_() + prev.getSapcers().length
  // ) {
  //   return true
  // }

  // if (
  //   prev &&
  //   op instanceof RemoveTextOperation &&
  //   prev instanceof RemoveTextOperation &&
  //   op.getEndIndex() === prev.getStartIndex()
  // ) {
  //   return true
  // }

  return false
}

const shouldOverwrite = (op: Operation, prev: Operation | undefined): boolean => {
  if (prev && op instanceof SetSelectionOperation && prev instanceof SetSelectionOperation) {
    return true
  }

  return false
}

const shouldClear = (op: Operation): boolean => {
  return op instanceof InsertTextOperation;
}

const addHistory = debounce((operations: Operation[], history: History) => {
    // if (operations instanceof SetSelectionOperation) {
    //   return
    // }
    const { undos } = history;
    let lastBatch = undos[undos.length - 1];
    let lastBatchOp = lastBatch && lastBatch[lastBatch.length - 1];
    let sameBatch = false;
    for (let op of operations) {
      let overwrite = false;
      // 将连续的选区变动合并，减少消耗,同时这里涉及到撤销时光标跟随的逻辑
      if (op instanceof SetSelectionOperation && lastBatchOp && lastBatchOp instanceof SetSelectionOperation) {
        op = SetSelectionOperation.merge(lastBatchOp, op);
        overwrite = true;
      }
      if (sameBatch || overwrite) {
        if (overwrite) {
          lastBatch.pop()
        }
        lastBatch.push(op);
      } else {
        lastBatch = [op];
        undos.push(lastBatch);
        sameBatch = true; // 超过节流时间强制合并
      }
      lastBatchOp = op;
      if (shouldClear(op)) {
        history.redos = [];
      }
    }
    // TODO 可以考虑放异步
    while (undos.length > 100) {
      undos.shift();
    }
    operations.length = 0;
}, 300);
