
<p align="center">
<img width=130 alt="web-editor-markdown" src="https://gitee.com/zengyong2020/web-editor-markdown/raw/master/markdown.jpeg" />
<br>
A markdown editor in browser, supports collaborative editing
<br><br>
<a title="npm bundle size" target="_blank" href="https://www.npmjs.com/package/web-editor-markdown"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/web-editor-markdown?style=flat-square&color=blueviolet"></a>
<a title="Version" target="_blank" href="https://www.npmjs.com/package/web-editor-markdown"><img src="https://img.shields.io/npm/v/web-editor-markdown.svg?style=flat-square"></a>
<a title="Downloads" target="_blank" href="https://www.npmjs.com/package/web-editor-markdown"><img src="https://img.shields.io/npm/dt/web-editor-markdown.svg?style=flat-square&color=97ca00"></a>
<!-- <a title="Visitors" target="_blank" href="javascript:;"><img src="https://visitor-badge.glitch.me/badge?page_id=zengyong.web-editor-markdown"></a> -->
<br>
</p>

## 💡 Web Editor Markdown

[web-editor-markdown](https://github.com/Ben-love-zy/web-editor-markdown.git) is a Markdown editor in Web browser and for real-time rendering like `Typora`. It is based on TypeScript and JavaScript, and does not rely on any third-party framework. It supports Chinese friendly and can be easily extended and connected to native JavaScript, Vue, React, Angular and other applications. It provides four rendering modes: `SOURCE`, `SOURCE_AND_PREVIEW`, `RENDER` and `PREVIEW`. If necessary, its underlying layer also supports the ability of collaborative editing and provides atomic `Operation` for extending collaborative editing.

### ✨ English Demo
![](https://gitee.com/zengyong2020/web-editor-markdown/raw/master/demo-en.gif)
### ✨ Chinese Demo
![](https://gitee.com/zengyong2020/web-editor-markdown/raw/master/demo-zh.gif)


### 🛠️ Getting started
* install it
```shell
npm install web-editor-markdown --save
```
* use it
```ts
import { Editor, withUndoRedo } from "web-editor-markdown";
let editor = new Editor(document.getElementById('id'));
editor = withUndoRedo(editor); // UndoRedo Plugin
editor.insertTextAtCursor('**This is a bold text**\n> tips：You can switch source mode with `cmd+/`');
```

* others
```ts
import { EditorViewMode } from "web-editor-markdown";
editor.switchViewMode(EditorViewMode.PREVIEW); // switch rendering mode，(shortcut key: 'cmd+/')
console.log('content', editor.getContent());
```

* local source
```shell
npm install
npm start
```
