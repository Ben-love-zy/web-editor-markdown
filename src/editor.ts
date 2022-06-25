/*
 * @Description: 编辑器核心控制器及入口
 * @Author: ZengYong
 * @CreateDate: 2021-09-17 19:19:18
 */
import { TextModel, SelectionModel } from './model';
import { InsertTextOperation, RemoveTextOperation, SetSelectionOperation, Operation} from './operations';
import { ViewProvider, ViewMode, View } from './view'
import EventHandler from './event'
import blockCreaterFactory from "./markdown-parse/markdown-block-creater/factory";
import { isSpacerOrTab, getPreSpacerOrTab } from './markdown-parse/funs';

export const EditorViewMode = ViewMode;

export interface EditorConfigProps {
  mode?: ViewMode,
  placeholder?: string
}

interface EditorConfigInnerProps {
  mode: ViewMode,
  placeholder: string
}


export class Editor {
  protected markdownStringCompleter_ = new blockCreaterFactory().build();
  protected style_: HTMLStyleElement;
  protected elementContainer_: HTMLElement;
  protected element_: HTMLElement;
  protected config_: EditorConfigInnerProps;
  protected textModel_: TextModel;
  protected selectionModel_: SelectionModel;
  protected viewProvider_: ViewProvider;
  protected view_: View;
  protected eventHandler_: EventHandler;
  // protected operations_: Operation[] = [];

  constructor (elementContainer_: HTMLElement, config: EditorConfigProps = {}) {
    this.elementContainer_ = elementContainer_;
    this.config_ = {
      mode: ViewMode.RENDER,
      placeholder: '',
      ...config
    };
    this.initElement_();
    // this.initStyle_();
    this.textModel_ = new TextModel();
    this.selectionModel_ = new SelectionModel(this.textModel_);
    this.viewProvider_ = new ViewProvider();
    this.initView_();
    
  }

  private initElement_ () {
    const element = document.createElement("pre");
    element.setAttribute("placeholder", this.config_.placeholder);
    element.setAttribute("contenteditable", "true");
    element.setAttribute("spellcheck", "false");
    // element.setAttribute("style", "width: 50%; height: 100%; outline: 0 none; background-color: #fff");
    element.setAttribute("class", "editor-pre");
    this.elementContainer_.appendChild(element);
    // element.innerHTML = '<blockquote i="0-23"><ul i="2-23"><li i="2-8"><p i="4-8">123</p></li><li i="10-23"><p i="12-23">456<strong i="3-10">789</strong>0</p></li></ul></blockquote>'
    this.element_ = element;
  }

  private initView_ () {
    this.view_ = this.viewProvider_.provide(this.config_.mode, this.textModel_, this.selectionModel_, this.element_);
    this.eventHandler_ = new EventHandler(this, this.view_);
    this.eventHandler_.addListeners();
    this.view_.render();
  }

  private initStyle_ () {
    const style = document.createElement('style');
    style.innerHTML='.marker{ display: none }';
    document.getElementsByTagName('HEAD').item(0)?.appendChild(style);
    this.style_ = style;
  }

  getTextModel () {
    return this.textModel_;
  }

  getSelectionModel () {
    return this.selectionModel_;
  }

  getElement () {
    return this.element_;
  }

  focus () {
    this.element_.focus();
  }

  blur () {
    this.element_.blur();
  }
  /** 所有 operation 执行的入口函数 */
  apply (operation: Operation) {
    operation.apply(this);
    // console.error('apply', this.textModel_, this.selectionModel_)
    // this.operations_.push(operation);
    this.focus();
  }
  
  /** 在光标或者选区处插入字符串 */
  insertTextAtCursor (text: string) {
    const enterComplete = this.beforeInsert(text);
    text = enterComplete.input;
    if (!text.length) {
      return;
    }
    const selection = this.selectionModel_.getSelection();
    let startIndex = selection.anchor;
    if (!this.selectionModel_.isCollapsed()) {
      this.apply(new RemoveTextOperation(selection.anchor, selection.focus));
      if (this.selectionModel_.isBackward()) {
        startIndex = selection.focus;
      }
    }
    const cursorDelta = enterComplete.cursorDelta === undefined ? text.length : enterComplete.cursorDelta;
    this.apply(new InsertTextOperation(text, startIndex));
    this.setSelection(startIndex + cursorDelta); // 更新选区光标模型
  }

  /** 任意位置插入字符串，光标保持在原位置 */
  insertText (index: number, text: string) {
    const selection = this.selectionModel_.getSelection();
    this.apply(new InsertTextOperation(text, index));
    if (selection.anchor <= index) {
      this.setSelection(selection.anchor);
    } else {
      this.setSelection(selection.anchor + text.length);
    }
  }

  /** 在光标处往回删除一个字符，如果有选中，则删除整个选区 */
  deleteTextAtCursor () {
    let selection = this.selectionModel_.getSelection();
    let startIndex = selection.anchor;
    if (!this.selectionModel_.isCollapsed()) {
      this.apply(new RemoveTextOperation(selection.anchor, selection.focus));
      if (this.selectionModel_.isBackward()) {
        startIndex = selection.focus;
      }
    } else if (selection.anchor > 0) {
      const deleteResult = this.beforeDelete();
      const deleteLen = deleteResult.deleteLen;
      if (deleteLen === 0) {
        return;
      }
      if (deleteResult.cursorDelta !== undefined && deleteResult.cursorDelta > 0) {
        startIndex += deleteResult.cursorDelta;
        this.setSelection(startIndex); 
      }
      const deleteStartIndex = startIndex - deleteLen;
      this.apply(new RemoveTextOperation(deleteStartIndex, startIndex));
      startIndex = deleteStartIndex;
    }

    this.setSelection(startIndex); // 更新选区光标模型
  }

  /** 任意位置删除字符串，光标保持原位置 */
  deleteText (index: number, len: number) {
    const selection = this.selectionModel_.getSelection();
    this.apply(new RemoveTextOperation(index, index + len));
    if (selection.anchor <= index) {
      this.setSelection(selection.anchor);
    } else if (index + len < selection.anchor) {
      this.setSelection(selection.anchor - len);
    } else {
      this.setSelection(index);
    }
  }

  /** 设置选区或光标 */
  setSelection (anchor: number, focus?: number) {
    this.apply(new SetSelectionOperation({ anchor: anchor, focus: focus || focus === 0 ? focus : anchor }));
  }

  /** 取消选区 */
  removeSelection () {
    this.apply(new SetSelectionOperation(null));
  }

  /** 光标回移 */
  moveBackward () {
    const selection = this.selectionModel_.getSelection();
    if (!this.selectionModel_.isCollapsed()) {
      // TODO
    }
  }

  /** 光标正移 */
  moveForward () {
    const selection = this.selectionModel_.getSelection();
    if (!this.selectionModel_.isCollapsed()) {
      // TODO
    }
  }

  /** 切换渲染模式 */
  switchViewMode (mode?: ViewMode) {
    if (mode === this.config_.mode) {
      return;
    }
    let newMode = mode;
    if (!newMode) {
      if (this.config_.mode === ViewMode.RENDER) {
        newMode = ViewMode.SOURCE
      } else {
        newMode = ViewMode.RENDER
      }
    }
    this.eventHandler_.dispose();
    this.view_.dispose();
    this.config_.mode = newMode;
    this.initView_();
    this.focus();
  }

  beforeInsert (input: string) {
    let cursorDelta: number | undefined;
    let originInput = input;
    if (input === '\n') {
      const inDom = this.view_.inDom('table');
      if (inDom) {
         // TODO 表格中回车，其他的补充输入后续都考虑利用view的inDom方法来识别，而不是在creater里面再去解析一次
        const sourceIndex = inDom.sourceIndex;
        const textL = this.textModel_.getLength();
        // md解析渲染时已经隐藏了表格后面的一个空白行
        input = sourceIndex[1] === textL ? '\n\n' : '\n';
        this.insertText(sourceIndex[1], input);
        this.setSelection(sourceIndex[1] + 2);
        input = '';
      } else {
        const selection = this.selectionModel_.getSelection();
        let line = this.textModel_.getLineByIndex(selection.anchor);
        while(true) {
          let preSpacerOrTab = getPreSpacerOrTab(line);
          let preLen = preSpacerOrTab.length;
          if (preLen) {
            line = line.slice(preLen);
            // input += preSpacerOrTab;
          }
          const completeResult = this.markdownStringCompleter_.complete({ line });
          if (completeResult) {
            line = completeResult.lineRest;
            input += preSpacerOrTab + completeResult.completeInput;
            if (completeResult.cursor !== undefined) {
              // 代码块源码模式不做自动补齐，暂时不太优雅地在此处处理
              if (this.config_.mode !== ViewMode.RENDER) {
                return { input: originInput };
              }
              cursorDelta = completeResult.cursor + 1;
            }
          } else {
            break;
          }
        }
      }
    } else if (this.config_.mode === ViewMode.RENDER && input === '\t') {
      const selection = this.selectionModel_.getSelection();
      let line = this.textModel_.getLineByIndex(selection.anchor);
      const match = line.match(/^(\s*[*+-]\s+)+/) || line.match(/^(\s*(\d{1,9})([.)])\s+)+/);
      if (match && match[0].length === line.length) {
        this.insertText(selection.anchor - line.length, '\t');
        input = '';
      }
    } else if (this.config_.mode === ViewMode.SOURCE && input === '|' && this.view_.inDom('table')) {
      if (this.view_.inDom('table')) {
        input = '\\|';
      }
    }
    return { input, cursorDelta };
  }

  beforeDelete () {
    if (this.config_.mode !== ViewMode.RENDER) {
      return { deleteLen: 1 };
    }
    const selection = this.selectionModel_.getSelection();
    const inDom = this.view_.inDom('td') || this.view_.inDom('th');
    if (inDom) {
      const sourceIndex = inDom.sourceIndex;
      if (sourceIndex[0] === selection.anchor) {
        return { deleteLen: 0 };
      }
    }
    let cursorDelta: number | undefined;
    let line = this.textModel_.getLineByIndex(selection.anchor);
    let deleteLen = 1;
    while(true) {
      let preSpacerOrTab = getPreSpacerOrTab(line);
      let preLen = preSpacerOrTab.length;
      if (preLen) {
        line = line.slice(preLen);
        if (line.length === 0) {
          deleteLen += preLen;
          break;
        }
      }
      const deleteResult = this.markdownStringCompleter_.delete({ line });
      if (deleteResult) {
        line = deleteResult.lineRest;
        deleteLen = deleteResult.deleteLen;
        if (deleteResult.cursor !== undefined && deleteResult.cursor > 0) {
          cursorDelta = deleteResult.cursor; // 先往后移动光标
        }
      } else {
        break;
      }
    }
    return { deleteLen: line.length ? 1 : deleteLen, cursorDelta };


    // let preSpacerOrTab = getPreSpacerOrTab(line);
    // let preLen = preSpacerOrTab.length;
    // let deleteLen = 1;
    // if (preLen) {
    //   line = line.slice(preLen);
    //   if (line.length === 0) {
    //     deleteLen = preLen + 1; // + 1是把换行符也删掉
    //     return deleteLen;
    //   }
    // }
    // const deleteResult = this.markdownStringCompleter_.delete({ line });
    // if (deleteResult) {
    //   deleteLen = deleteResult.deleteLen;
    // }
    // return deleteLen;
  }

  getContent () {
    return this.textModel_.getSpacer();
  }

  setContent (content: string) {
    this.textModel_.setContent(content);
    this.setSelection(0);
  }

  clearContent () {
    this.textModel_.clear();
    this.setSelection(0);
  }

  /** 清理已经添加的 dom 和事件等 */
  dispose () {
    this.eventHandler_.dispose();
    this.view_.dispose();
    this.element_.remove();
    this.style_.remove();
  }
 
}

export default Editor;