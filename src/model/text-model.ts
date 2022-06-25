
import EventEmitter from "events";
import { debounce } from "../utils/debounce";
/*
 * @Description: 文档内容数据模型
 * @Author: ZengYong
 * @CreateDate: 2021-09-17 19:16:37
 */
export class TextModel extends EventEmitter {

  static EVENT_TYPE = {
    TEXT_CHANGE: 'text-change'
  }

  protected spacers_: string;
  protected textChangeEmit_: () => void;

  constructor (spacers?: string) {
    super();
    this.spacers_ = spacers || '';
    this.textChangeEmit_ = debounce(() => {
      this.emit(TextModel.EVENT_TYPE.TEXT_CHANGE);
    });
  }

  getSpacer () {
    return this.spacers_;
  }

  getLength () {
    return this.spacers_.length;
  }

  insert(spacerIndex: number, spacers: string) {
    const originalSpacers = this.spacers_;
    this.spacers_ = originalSpacers.slice(0, spacerIndex) + spacers + originalSpacers.slice(spacerIndex);
    this.textChangeEmit_();
  }

  remove(startIndex: number, endIndex: number) {
    const originalSpacers = this.spacers_;
    if (startIndex > endIndex) {
      [ startIndex, endIndex ] = [ endIndex, startIndex];
    }
    this.spacers_ = originalSpacers.slice(0, startIndex) + originalSpacers.slice(endIndex);
    this.textChangeEmit_();
    return originalSpacers.slice(startIndex, endIndex);
  }

  /** 获取坐标所在行的坐标前面的内容 */
  getLineByIndex (index: number) {
    index--;
    let line = '';
    while (index >=0 && this.spacers_[index] !== '\n') {
      line = this.spacers_[index] + line;
      index--
    }
    return line;
  }

  setContent (spacers: string) {
    this.spacers_ = spacers;
    this.textChangeEmit_();
  }

  clear () {
    this.spacers_ = '';
    this.textChangeEmit_();
  }
}

export default TextModel;
