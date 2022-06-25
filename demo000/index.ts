import { Editor, EditorViewMode } from "../src";
import { withUndoRedo } from "../src/extend/undo-redo";
import { text } from "./text";
import localforage from "localforage";
const container = document.getElementById('myEditor');
const contentStorageKey = 'content-list';
let currId: string = '';
let currTitle: string = '';
let currContent: string = '';
let contentList: any[] = [];
let editor: Editor;
if (container) {
  const modeCache = parseInt(localStorage.getItem('mode-cache') || '1');
  window['editor'] = editor = withUndoRedo(new Editor(container, { placeholder: '请输入内容！'}));


  const btns = document.getElementsByClassName('mode-btn');
  window['changeMode'] = (n: number) => {
    localStorage.setItem('mode-cache', '' + n);
    for (let i = 0; i < btns.length; i++) {
      btns[i].setAttribute('class', 'mode-btn');
    }
    btns[n - 1].setAttribute('class', 'mode-btn curr');
    const mode = getModeByIndex(n);
    editor.switchViewMode(mode);
  }

  window['changeMode'](modeCache);

  const themeBtns = document.getElementsByClassName('theme-btn');
  const bodyEle = document.getElementsByTagName('body')[0];
  const themeCache = parseInt(localStorage.getItem('theme-cache') || '1');
  window['changeTheme'] = (n: number) => {
    localStorage.setItem('theme-cache', '' + n);
    for (let i = 0; i < themeBtns.length; i++) {
      themeBtns[i].setAttribute('class', 'theme-btn');
    }
    themeBtns[n - 1].setAttribute('class', 'theme-btn curr');
    if (n === 2) {
      bodyEle.setAttribute('class', 'dark');
    } else {
      bodyEle.setAttribute('class', 'light');
    }
  }
  window['changeTheme'](themeCache);

  
  showList().then((data) => {
    contentList = data;
    if (!data || data.length === 0) {
      editor.insertTextAtCursor(text);
      addHandler('默认 Demo', text);
    } else {
      const item = data[data.length-1];
      currId = item.id;
      currTitle = item.title;
      currContent = item.content;
      showDetail();
    }
  }).catch(() => {
    editor.insertTextAtCursor(text);
    addHandler('默认 Demo', text);
    window.alert('本地数据库初始化失败');
  });
}

function getModeByIndex (i: number) {
  switch (i) {
    case 1: return EditorViewMode.RENDER;
    case 2: return EditorViewMode.SOURCE_AND_PREVIEW;
    case 3: return EditorViewMode.SOURCE;
    case 4: return EditorViewMode.PREVIEW;
    default: return EditorViewMode.RENDER;
  }
}


window['saveClick'] = async function () {
  const result = await updateHandler()
  if (result) {
    window['alert']('保存成功');
  } else {
    window['alert']('请先新建');
  }
  
}

window['addDialog'] = async function () {
  updateHandler();
  const title = window['prompt']('请输入名称');
  if (title) {
    await addHandler(title);
    showDetail();
  }
}

window['deleteClick'] = async function () {
  await deleteHandler();
  currId = '';
  currTitle = '';
  currContent = '';
  showDetail();
  window['alert']('删除完成');
}

window['clearAll'] = async function () {
  await localforage.clear();
  window['alert']('清除完成，刷新后恢复默认 Demo');
  location.reload();
}

window['showDetail'] = function (id?: string, title?: string) {
  updateHandler();
  showDetail(id, title);
  showList();
}

window['download'] = function () {
  currContent = window['editor'].getContent();
  const a = document.createElement('a');
  const blob = new Blob([currContent]);
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = (currTitle || '无标题') + '.md';
  a.click()
  window.URL.revokeObjectURL(url);
}

async function addHandler (title: string, content: string = '') {
  const id = 'id' + new Date().getTime();
  if (!currId && !content) {
    currContent = window['editor'].getContent() || '';
  } else {
    currContent = content;
  }
  currId = id;
  currTitle = title;
  contentList.push({
    id,
    title,
    content: currContent
  });
  await save();
  await showList();
  showDetail();
}

function showDetail (id?: string, title?: string) {
  if (id) {
    currId = id;
  }
  if (title) {
    currTitle = title;
  }
  if (!currId) {
    window['editor'].setContent('');
    return;
  };
  for (let item of contentList) {
    if (item.id === currId) {
      currTitle = item.title;
      currContent = item.content;
      window['editor'].setContent(currContent);
      return;
    }
  }
}
async function updateHandler () {
  if (!currId) return false;
  for (let i = 0; i < contentList.length; i++) {
    if (contentList[i].id === currId) {
      contentList[i].title = currTitle;
      currContent = window['editor'].getContent();
      contentList[i].content = currContent;
      await save();
      await showList();
      return true;
    }
  }
  return false;
}
async function deleteHandler () {
  if (!currId) return;
  for (let i = 0; i < contentList.length; i++) {
    if (contentList[i].id === currId) {
      contentList.splice(i, 1);
      await save();
      await showList();
      return
    }
  }
}
async function showList () {
  const contentContainer = document.getElementById('content-list');
  if (contentList.length === 0) {
    const data: string | null = await localforage.getItem(contentStorageKey);
    if (data) {
      contentList = JSON.parse(data);
    }
  }
  let htm = '';
  for (const c of contentList) {
    htm += `<li class="${c.id===currId ? 'curr' : ''}" i="${c.id}" onclick="showDetail('${c.id}', '${c.title}')">${c.title}</li>`;
  }
  if (contentContainer) {
    contentContainer.innerHTML = htm;
  }
  return contentList;
}

async function save () {
  return localforage.setItem(contentStorageKey, JSON.stringify(contentList));  
}