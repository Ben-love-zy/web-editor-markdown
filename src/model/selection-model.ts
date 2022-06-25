import EventEmitter from "events";
import { TextModel } from "./text-model";
import { debounce } from "../utils/debounce";
/*
 * @Description: 选区数据模型
 * @Author: ZengYong
 * @CreateDate: 2021-09-17 19:17:06
 */

export interface SelectionCustom {
  anchor: number;
  focus: number;
}

export class SelectionModel extends EventEmitter {

  static EVENT_TYPE = {
    SELECTION_CHANGE: 'selection-change'
  }

  protected textModel_: TextModel;
  protected selection_: SelectionCustom | null;
  protected eventTimer_: number | null;
  protected selectionChangeEmit_: () => void;

  constructor (textModel: TextModel) {
    super();
    this.textModel_ = textModel;
    this.selection_ = { anchor: 0, focus: 0 };
    this.selectionChangeEmit_ = debounce(() => {
      this.emit(SelectionModel.EVENT_TYPE.SELECTION_CHANGE);
    }, 100);
  }
  /** 判断两个选区模型是否是同一块区域 */
  static isEqual (selection1: SelectionCustom, selection2: SelectionCustom) {
    return selection1.anchor === selection2.anchor && selection1.focus === selection2.focus;
  }

  getSelection () {
    return { ...this.selection_ } as SelectionCustom;
  }

  setSelection (selection: SelectionCustom | null) {
    if (selection && this.selection_ && selection.anchor === this.selection_.anchor && selection.focus === this.selection_.focus) {
      return;
    }
    this.selection_ = selection ? { ...selection } : null;
    // 模型选区变化事件目前其实不需要发布，因为view在textModel发布后会立即更新selection，而不是等待订阅选区模型的事件更新，只有通过api调用设置选区才会有此触发场景
    // 并且textModel发布事件时有节流延时，所以view在接收到更新时已经能获取到选区最新数据
    // this.selectionChangeEmit_();
  }

  isCollapsed () {
    return this.selection_ && this.selection_.anchor === this.selection_.focus;
  }

  isBackward () {
    return this.selection_ && this.selection_.anchor > this.selection_.focus;
  }

  /** 折叠选区, toStart 表示以视觉上的开始点为准，而不是以 focus 为准 */
  // collapse (toStart?: boolean) {
  //   if (toStart === true) {
  //     this.selection_.anchor < this.selection_.focus ? this.selection_.anchor = this.selection_.focus : this.selection_.focus = this.selection_.anchor;
  //   } else {
  //     this.selection_.anchor = this.selection_.focus;
  //   }
  //   return { ...this.selection_ } as SelectionCustom;
  // }

  /** 移动光标位置，负数为后退，正数为前进 */
  move (n: number) {

  }

}

export default SelectionModel;
