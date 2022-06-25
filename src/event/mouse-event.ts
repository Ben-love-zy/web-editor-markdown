// import { Editor } from "..";
import BaseEventHandler from "./base-event";
/*
 * @Description: 鼠标事件
 * @Author: ZengYong
 * @CreateDate: 2021-09-18 17:01:46
 */
export class MouseEventHandler extends BaseEventHandler{

  // constructor (editor: Editor) {
  //   super(editor);
  // }

  mousedownHandler_ (e: MouseEvent) {

  }

  mousemoveHandler_ (e: MouseEvent) {

  }

  mouseupHandler_ (e: MouseEvent) {

  }

  addListeners () {
    const mousedownHandlerBinder_ = this.mousedownHandler_.bind(this);
    const mousemoveHandlerBinder_ = this.mousemoveHandler_.bind(this);
    const mouseupHandlerBinder_ = this.mouseupHandler_.bind(this);

    this.target.addEventListener('mousedown', mousedownHandlerBinder_);
    this.target.addEventListener('mousemove', mousemoveHandlerBinder_);
    this.target.addEventListener('mouseup', mouseupHandlerBinder_);

    this.cacheEventHandler ({ type: 'mousedown', listener: mousedownHandlerBinder_ });
    this.cacheEventHandler ({ type: 'mousemove', listener: mousemoveHandlerBinder_ });
    this.cacheEventHandler ({ type: 'mouseup', listener: mouseupHandlerBinder_ });
  }
}
export default MouseEventHandler;