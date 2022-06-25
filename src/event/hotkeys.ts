import { isKeyHotkey } from 'is-hotkey'
import { IS_APPLE } from '../utils/browser'

/*
 * @Description: 键盘快捷键集中识别
 * @Author: ZengYong
 * @CreateDate: 2021-09-24 12:17:11
 */

interface KeyHotFun {
  [x: string]: (e: KeyboardEvent) => boolean
}

class Hotkeys {
  /** 提前调用 isKeyHotkey 解析，提升运行效率 */
  static IS_KEYS: KeyHotFun = {
    moveBackward: isKeyHotkey('left'),
    moveForward: isKeyHotkey('right'),
    deleteBackward: isKeyHotkey('shift?+backspace'),
    deleteForward: isKeyHotkey('shift?+delete'),
    isTab: isKeyHotkey('tab'),
    undo: isKeyHotkey('mod+z'),
    redo: IS_APPLE ? isKeyHotkey('cmd+shift+z') : isKeyHotkey('ctrl+y'),
    changeMode: isKeyHotkey('mod+/'),
  };
  static instance: Hotkeys;

  private constructor () {}

  static getInstance () {
    if (!this.instance) {
      this.instance = new Hotkeys();
    }
    return this.instance
  }

  isMoveBackward (e: KeyboardEvent) {
    return Hotkeys.IS_KEYS['moveBackward'](e);
  }

  isMoveForward (e: KeyboardEvent) {
    return Hotkeys.IS_KEYS['moveForward'](e);
  }

  isDeleteBackward (e: KeyboardEvent) {
    return Hotkeys.IS_KEYS['deleteBackward'](e);
  }

  isDeleteForward (e: KeyboardEvent) {
    return Hotkeys.IS_KEYS['deleteForward'](e);
  }

  isTab (e: KeyboardEvent) {
    return Hotkeys.IS_KEYS['isTab'](e);
  }

  isRedo (e: KeyboardEvent) {
    return Hotkeys.IS_KEYS['redo'](e);
  }

  isUndo (e: KeyboardEvent) {
    return Hotkeys.IS_KEYS['undo'](e);
  }
  isChangeMode (e: KeyboardEvent) {
    return Hotkeys.IS_KEYS['changeMode'](e);
  }
}
export default Hotkeys.getInstance();;