import { Editor, EditorViewMode } from "../src";
import { withUndoRedo } from "../src/extend/undo-redo";
import { text } from "./text";
const container = document.getElementById('myEditor');

let editor: Editor;
if (container) {
  const modeCache = parseInt(localStorage.getItem('mode-cache') || '1');
  window['editor'] = editor = withUndoRedo(new Editor(container, { placeholder: '请输入内容！'}));
  editor.insertTextAtCursor(text);

  // const btns = document.getElementsByClassName('mode-btn');
  window['changeMode'] = (n: number) => {
    localStorage.setItem('mode-cache', '' + n);
    // for (let i = 0; i < btns.length; i++) {
    //   btns[i].setAttribute('class', 'mode-btn');
    // }
    // btns[n - 1].setAttribute('class', 'mode-btn curr');
    // const mode = getModeByIndex(n);
    // editor.switchViewMode(mode);
  }

  window['changeMode'](modeCache);
}