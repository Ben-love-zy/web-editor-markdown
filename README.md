## 💡 Web Editor Markdown
[web-editor-markdown](https://github.com/Ben-love-zy/web-editor-markdown.git) 是一款基于 Web 浏览器，即时渲染的 Markdown 编辑器。它基于 TypeScript 和 JavaScript 打造，并且不依赖任何第三方框架，对中文支持友好，可以方便的进行扩展并接入到原生 JavaScript、Vue、React、Angular等应用中。它提供`源码模式`、`双屏渲染模式`、`实时编辑模式`和`只读模式`四种渲染模式。如果有需要，它的底层同时也支持了协同编辑的能力，提供了原子操作 `Operation` 用于扩展协同编辑。
### ✨ 中文演示
!['中文演示图'](https://static.yximgs.com/udata/pkg/IS-DOCS-MD/zengyong/img/demo-zh.gif)
### ✨ 英文演示
![Demo](https://static.yximgs.com/udata/pkg/IS-DOCS-MD/zengyong/img/demo-en.gif)
### 🔮 在线体验 Demo 地址
  [点击体验](https://static.yximgs.com/udata/pkg/IS-DOCS-MD/zengyong/demo2/index.html)

### 🛠️ 使用说明
* Installing it
```shell
npm install web-editor-markdown --save
```
* Using it
```ts
import { Editor, withUndoRedo } from "web-editor-markdown";
let editor = new Editor(ele); // 初始化编辑器对象, ele 为 dom 容器
editor = withUndoRedo(editor); // “撤销回退”插件生效
```

* other
```ts
import { EditorViewMode } from "web-editor-markdown";
editor.switchViewMode(EditorViewMode.PREVIEW); // 切换模式：实时渲染、预览、源码、双屏模式
console.log('content', editor.getContent()); // 获取编辑内容
```
