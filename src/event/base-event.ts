import { Editor } from "..";
import { View } from '../view'
/*
 * @Description: 事件基类
 * @Author: ZengYong
 * @CreateDate: 2021-09-18 17:11:09
 */
interface EventItem {
  type: keyof HTMLElementEventMap;
  listener: (this: HTMLElement, ev: Event) => any;
}
export class BaseEventHandler {
  protected isComposing: boolean = false;
  protected editor: Editor;
  protected target: HTMLElement;
  protected view: View;
  protected eventList_: EventItem[] = [];
  constructor (editor: Editor, view: View) {
    this.editor = editor;
    this.target = editor.getElement() as HTMLElement;
    this.view = view;
  }

  compositionStartHandler (e: CompositionEvent) {
    this.isComposing = true;
  }

  compositionEndHandler (e: CompositionEvent) {
    this.isComposing = false;
  }

  getComposing () {
    return this.isComposing;
  }

  cacheEventHandler (eventItem: EventItem) {
    this.eventList_.push(eventItem);
  }

  addListeners () {
    const compositionStartHandlerBinder = this.compositionStartHandler.bind(this);
    const compositionEndHandlerBinder = this.compositionEndHandler.bind(this);

    this.target.addEventListener('compositionstart', compositionStartHandlerBinder);
    this.target.addEventListener('compositionend', compositionEndHandlerBinder);
    
    this.cacheEventHandler ({ type: 'compositionstart', listener: compositionStartHandlerBinder });
    this.cacheEventHandler ({ type: 'compositionend', listener: compositionEndHandlerBinder });
  }

  dispose () {
    for (let eventItem of this.eventList_) {
      this.target.removeEventListener(eventItem.type, eventItem.listener);
    }
    this.eventList_ = [];
  }
}
export default BaseEventHandler;