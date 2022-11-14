import { Editor, EditorViewMode, withUndoRedo } from "../src";
import { text } from "./text";
const container = document.getElementById('myEditor');

let editor: Editor;
if (container) {
  editor = withUndoRedo(new Editor(container, { placeholder: 'Please input your texts'}));
  editor.insertTextAtCursor(text);
  console.log('all contents', editor.getContent());
  const btns = document.getElementsByClassName('mode-btn');
  window['changeMode'] = (n: number) => {
    for (let i = 0; i < btns.length; i++) {
      btns[i].setAttribute('class', 'mode-btn');
    }
    btns[n - 1].setAttribute('class', 'mode-btn curr');
    switch (n) {
      case 1: editor.switchViewMode(EditorViewMode.RENDER);break;
      case 2: editor.switchViewMode(EditorViewMode.SOURCE_AND_PREVIEW);break;
      case 3: editor.switchViewMode(EditorViewMode.SOURCE);break;
      case 4: editor.switchViewMode(EditorViewMode.PREVIEW);break;
      default: editor.switchViewMode(EditorViewMode.RENDER);break;
    }
  }
  window['changeMode'](1);
}