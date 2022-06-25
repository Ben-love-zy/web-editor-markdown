import KeyboardEventHandler from "./keyboard-event";
import MouseEventHandler from "./mouse-event";
import ViewEventHandler from "./view-event";
import { Editor } from "..";
import { View } from '../view'

/*
 * @Description: 事件集中处理
 * @Author: ZengYong
 * @CreateDate: 2021-09-23 18:47:12
 */
export class EventHandler {
  protected keyboardEventHandler_: KeyboardEventHandler;
  protected mouseEventHandler_: MouseEventHandler;
  protected viewEventHandler_: ViewEventHandler;

  constructor (editor: Editor, view: View) {
    this.keyboardEventHandler_ = new KeyboardEventHandler(editor, view);
    this.mouseEventHandler_ = new MouseEventHandler(editor, view);
    this.viewEventHandler_ = new ViewEventHandler(editor, view);
  }

  addListeners () {
    this.keyboardEventHandler_.addListeners();
    this.mouseEventHandler_.addListeners();
    this.viewEventHandler_.addListeners();
  }

  dispose () {
    this.keyboardEventHandler_.dispose();
    this.mouseEventHandler_.dispose();
    this.viewEventHandler_.dispose();
  }
}
export default EventHandler;