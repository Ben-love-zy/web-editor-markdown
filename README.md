
<p align="center">
<img width=130 alt="web-editor-markdown" src="https://gitee.com/zengyong2020/web-editor-markdown/raw/master/markdown.jpeg" />
<br>
基于 web 端的 Markdown 编辑器，支持协同编辑扩展和方便的插件扩展
<br><br>
<a title="npm bundle size" target="_blank" href="https://www.npmjs.com/package/web-editor-markdown"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/web-editor-markdown?style=flat-square&color=blueviolet"></a>
<a title="Version" target="_blank" href="https://www.npmjs.com/package/web-editor-markdown"><img src="https://img.shields.io/npm/v/web-editor-markdown.svg?style=flat-square"></a>
<a title="Downloads" target="_blank" href="https://www.npmjs.com/package/web-editor-markdown"><img src="https://img.shields.io/npm/dt/web-editor-markdown.svg?style=flat-square&color=97ca00"></a>
<!-- <a title="Visitors" target="_blank" href="javascript:;"><img src="https://visitor-badge.glitch.me/badge?page_id=zengyong.web-editor-markdown"></a> -->
<br>
</p>

## 💡 Web Editor Markdown
[web-editor-markdown](https://github.com/Ben-love-zy/web-editor-markdown.git) 是一款基于 Web 浏览器，即时渲染的 Markdown 编辑器。它基于 TypeScript 和 JavaScript 打造，并且不依赖任何第三方框架，对中文支持友好，可以方便的进行扩展并接入到原生 JavaScript、Vue、React、Angular等应用中。它提供`源码模式`、`双屏渲染模式`、`实时编辑模式`和`只读模式`四种渲染模式。如果有需要，它的底层同时也支持了协同编辑的能力，提供了原子操作 `Operation` 用于扩展协同编辑。

[web-editor-markdown](https://github.com/Ben-love-zy/web-editor-markdown.git) is a Markdown editor based on Web browser and real-time rendering. It is based on TypeScript and JavaScript, and does not rely on any third-party framework. It supports Chinese friendly and can be easily extended and connected to native JavaScript, Vue, React, Angular and other applications. It provides four rendering modes: `SOURCE`, `SOURCE_AND_PREVIEW`, `RENDER` and `PREVIEW`. If necessary, its underlying layer also supports the ability of collaborative editing and provides atomic `Operation` for extending collaborative editing.

### ✨ 中文演示
![](https://gitee.com/zengyong2020/web-editor-markdown/raw/master/demo-zh.gif)
### ✨ Demo
![](https://gitee.com/zengyong2020/web-editor-markdown/raw/master/demo-en.gif)

### 🛠️ 使用说明
* 安装
```shell
npm install web-editor-markdown --save
```
* 使用
```ts
import { Editor, withUndoRedo } from "web-editor-markdown";
let editor = new Editor(document.getElementById('id')); // 初始化编辑器对象
editor = withUndoRedo(editor); // “撤销回退”插件生效
editor.insertTextAtCursor('**这是加粗文本**\n> 提示：通过 `cmd+/` 可以切换源码模式哦'); // 插入 markdown 内容
```

* 其他（更多 api 参考官网）
```ts
import { EditorViewMode } from "web-editor-markdown";
editor.switchViewMode(EditorViewMode.PREVIEW); // 切换模式：实时渲染、预览、源码、双屏模式，或者通过 cmd+/ 切换源码模式和实时渲染模式
console.log('content', editor.getContent()); // 获取编辑内容
```
