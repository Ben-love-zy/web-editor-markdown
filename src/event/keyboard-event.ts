// import { Editor } from "..";
import BaseEventHandler from "./base-event";
import hotkeys from "./hotkeys";
/*
 * @Description: 键盘事件
 * @Author: ZengYong
 * @CreateDate: 2021-09-18 17:01:46
 */
export class KeyboardEventHandler extends BaseEventHandler{
  // constructor (editor: Editor) {
  //   super(editor);
  // }

  compositionStartHandler (e: CompositionEvent) {
    super.compositionStartHandler(e);
  }

  compositionEndHandler (e: CompositionEvent) {
    super.compositionEndHandler(e);
    const text = e.data;
    if (text) {
      this.editor.insertTextAtCursor(text);
    }
  }

  // TODO 中文输入需要提取出来处理，这里中文输入有问题
  beforeInputHandler_ (e: InputEvent) {
    const inputType = e.inputType;
    if (inputType === 'insertCompositionText' || inputType === 'deleteCompositionText') {
      return;
    }
    e.preventDefault();
    let text: string | null = null;
    switch (inputType) {
      case 'deleteContentBackward': // 删除光标前面
        this.editor.deleteTextAtCursor();
        break;
      case 'deleteContentForward': // 删除光标后面
        // TODO
        break;
      case 'insertParagraph': // 回车
        this.editor.insertTextAtCursor('\n');
        break;
      case 'insertText':
        text = e.data;
        if (text) {
          this.editor.insertTextAtCursor(text);
        }
        break;
      case 'insertFromPaste':
        const data = e.dataTransfer;
        text = (data as DataTransfer).getData('text/plain')
        if (text) {
          this.editor.insertTextAtCursor(text);
        }
        break;
    }
  }

  keydownHandler_ (e: KeyboardEvent) {
    // console.error('e2', e, hotkeys.isTab(e))
    // if (hotkeys.isDeleteBackward(e)) {
    //   e.preventDefault();
    //   this.editor.deleteText();
    //   return;
    // }
    // if (hotkeys.isDeleteForward(e)) {
    //   e.preventDefault();
    //   return;
    // }
    // if (hotkeys.isMoveBackward(e)) {
    //   e.preventDefault();
    //   this.editor.moveBackward();
    //   return;
    // }
    // if (hotkeys.isMoveForward(e)) {
    //   e.preventDefault();
    //   this.editor.moveForward();
    //   return;
    // }
    if (hotkeys.isTab(e)) {
      e.preventDefault();
      this.editor.insertTextAtCursor('\t');
    }

    if (hotkeys.isRedo(e)) {
      e.preventDefault();
      if (this.editor['redo'] && typeof this.editor['redo'] === 'function') {
        this.editor['redo']();
      }
      return;
    }
    if (hotkeys.isUndo(e)) {
      e.preventDefault();
      if (this.editor['undo'] && typeof this.editor['undo'] === 'function') {
        this.editor['undo']();
      }
      return;
    }
    if (hotkeys.isChangeMode(e)) {
      e.preventDefault();
      this.editor.switchViewMode();
      return;
    }
  }

  addListeners () {
    const beforeInputHandlerBinder = this.beforeInputHandler_.bind(this);
    const keydownHandlerBinder = this.keydownHandler_.bind(this);
    const compositionStartHandlerBinder = this.compositionStartHandler.bind(this);
    const compositionEndHandlerBinder = this.compositionEndHandler.bind(this);
    this.target.addEventListener('beforeinput', beforeInputHandlerBinder);
    this.target.addEventListener('keydown', keydownHandlerBinder);
    this.target.addEventListener('compositionstart', compositionStartHandlerBinder);
    this.target.addEventListener('compositionend', compositionEndHandlerBinder);
    

    this.cacheEventHandler ({ type: 'beforeinput', listener: beforeInputHandlerBinder });
    this.cacheEventHandler ({ type: 'keydown', listener: keydownHandlerBinder });
    this.cacheEventHandler ({ type: 'compositionstart', listener: compositionStartHandlerBinder });
    this.cacheEventHandler ({ type: 'compositionend', listener: compositionEndHandlerBinder });
  }

}
export default KeyboardEventHandler;