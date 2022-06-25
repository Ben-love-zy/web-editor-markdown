/*
 * @Description: 视图层基类
 * @Author: ZengYong
 * @CreateDate: 2021-09-18 16:39:41
 */
import { TextModel, SelectionModel, SelectionCustom } from "../model/";
import EventEmitter from "events";
//@ts-ignore
import { Parser, HtmlRenderer } from "../markdown-parse/lib/index.js";
import markdown from "../markdown-parse"
import { debounce } from "../utils/debounce";

export interface IDomPoint {
  domNode: HTMLElement;
  domOffset: number
}
export class BaseView extends EventEmitter {
  static EVENT_TYPE = {
    SELECTION_CHANGE: 'selection-change'
  }
  protected textModel_: TextModel;
  protected selectionModel_: SelectionModel;
  protected viewContainer_: HTMLElement;

  private renderBinder_: any;
  // private updateDomSelectionBinder_: any;
  private domSelectionChangeHandlerBinder_: any;

  constructor (textModel: TextModel, selectionModel: SelectionModel, viewContainer: HTMLElement) {
    super();

    this.textModel_ = textModel;
    this.selectionModel_ = selectionModel;
    this.viewContainer_ = viewContainer;
    this.viewContainer_.setAttribute('contenteditable', 'true');
    this.addListeners();
    // this.render();

  }

  /** 鼠标或键盘导致的原生 dom 选区变化，同步到选区模型 */
  domSelectionChangeHandler (e: Event) {
    const domSelection = window.getSelection();
    let selection: SelectionCustom | null = null;
    if (domSelection) {
      selection = this.domSelToCustomSel(domSelection);
    }
    this.showMarker(domSelection);
    this.emit(BaseView.EVENT_TYPE.SELECTION_CHANGE, selection);
  }

  /** 更新 dom 真实选区 */
  updateDomSelection () {
    // TODO 暂时不放timer里，到时测试一下性能
    const domSelection = window.getSelection();
    if (domSelection) {
      // const selectionFromDom = this.domSelToCustomSel(domSelection);
      const selectionFromModel = this.selectionModel_.getSelection();
      // TODO：见下面注释
      /** 
       * 如果即将更新到 dom 的选区和当前 dom 本身的选区一致，则不需操作dom。这里的判断逻辑是否影响光标操作体验待测试。
       * 两个原因：1.避免冗余的dom操作；2.如果变化原因本身就是 dom 自身触发的，若数据模型再去触发 dom 更新，陷入循环
       * 补充解释：注释掉，暂时不需要判断了，因为当前已经取消了对selectionModel事件的订阅，因此只有view的主动调用才会执行此函数
       */
      // if (!SelectionModel.isEqual(selectionFromDom, selectionFromModel)) {
      domSelection.removeAllRanges();
      const range = this.customSelToDomSel(selectionFromModel);
      if (range) {
        domSelection.addRange(range);
        // 立即调用showmarker，避免在marker之间输入时，marker触发延时导致闪烁的问题
        this.showMarker(domSelection);
      }
      // }
    }
  }

  addListeners () {
    // 模型事件
    this.renderBinder_ = this.render.bind(this);
    // 模型事件触发已经节流，此处不需节流
    this.textModel_.on(TextModel.EVENT_TYPE.TEXT_CHANGE, this.renderBinder_);

    //（暂时取消订阅，参考selectionModel中的发布事件说明）
    // this.updateDomSelectionBinder_ = this.updateDomSelection_.bind(this);
    // this.selectionModel_.on(SelectionModel.EVENT_TYPE.SELECTION_CHANGE, this.updateDomSelectionBinder_);

    // dom 选区事件
    this.domSelectionChangeHandlerBinder_ = debounce(this.domSelectionChangeHandler.bind(this), 50);
    window.document.addEventListener('selectionchange', this.domSelectionChangeHandlerBinder_);
  }


  /** 将选区模型转换成 Dom 的真实选区 */
  customSelToDomSel (customSelection: SelectionCustom) {
    let range: Range | null = null;
    if (customSelection) {
      const rangeStart = this.customPointToDomPoint(customSelection.anchor);
      const rangeEnd = customSelection.anchor === customSelection.focus ? rangeStart : this.customPointToDomPoint(customSelection.focus);
      if (rangeStart && rangeEnd) {
        range = window.document.createRange();
        range.setStart(rangeStart.domNode, rangeStart.domOffset);
        range.setEnd(rangeEnd.domNode, rangeEnd.domOffset);
      }
      // range.collapse(true);
    }
    return range;
  }

  /** 将 Dom 真实选区转换成选区模型 */
  domSelToCustomSel (domSelection: Selection) {
    let selection: SelectionCustom = { anchor: 0, focus: 0 };
    if (domSelection.anchorNode) {
      const anchorIndex = this.domPointToCustomPoint({
        domNode: domSelection.anchorNode as HTMLElement,
        domOffset: domSelection.anchorOffset
      });
      const focusIndex = domSelection.isCollapsed 
        ? anchorIndex
        : this.domPointToCustomPoint({
            domNode: domSelection.focusNode as HTMLElement,
            domOffset: domSelection.focusOffset
          });
      selection = { anchor: anchorIndex, focus: focusIndex }
    }
    return selection
  }
  /** TODO 此方法应该被不同渲染模式子类重写 */
  customPointToDomPoint (customPoint: number) {
    let container: HTMLElement = this.viewContainer_;
    let offset: number = 0;
    let eles;
    let domPoint: IDomPoint | null = null;
    while (eles = container.childNodes) {
      if (eles.length === 0) {
        break;
      }
      // 前一个节点，若没有找到显性的区间节点，则可能使用上一个节点的末尾或者下一节点的开头
      let preChild: HTMLElement | null = null;
      let preSourceIndex: number[] | null = null;
      let len = eles.length;
      for (let i = 0; i < len; i++) {
        const ele = eles[i] as HTMLElement;
        const soucrIndex = this.getNodeSource_(ele);
        // 注意：源码映射的子元素之间不一定是连续的soucrIndex，但是有序的，因为有些元素是消耗了隐藏的soucrIndex。
        if (customPoint >= soucrIndex[0] && customPoint <= soucrIndex[1]) {
          container = ele;
          offset = customPoint - soucrIndex[0];
          break;
        } else if (customPoint < soucrIndex[0]) { // 说明目标在前面的隐性区间
          if (!preChild) { // 行首隐性区间
            container = ele;
            offset = 0;
          } else {
            container = preChild;
            offset = customPoint - (preSourceIndex as number[])[0];
          }
          break;
        } else if (i === len - 1) { // 说明落在了行尾的隐性区间
          container = ele;
          offset = soucrIndex[1] - soucrIndex[0];
          break;
        }
        preChild = ele;
        preSourceIndex = soucrIndex;
      }
    }
    if (!(container instanceof Text) && offset > 0) { // offset=0时就保持原节点，否则无法兼容空p标签，即换行时光标无法自动落在空行
      if (container.nextSibling) {
        container = container.nextSibling as HTMLElement;
        offset = 0;
      } else {
        container = container.parentElement as HTMLElement;
        offset = container.childNodes.length;
      }
    }
    domPoint = {
      domNode: container,
      domOffset: offset
    }
    return domPoint;
  }

  /** TODO 此方法应该被不同渲染模式子类重写 */
  domPointToCustomPoint (domPoint: IDomPoint) {
    let domNode = domPoint.domNode;  
    const sourceIndex = this.getNodeSource_(domNode);
    let domOffset = domPoint.domOffset;
    let point = sourceIndex[0] + domOffset;
    if (!(domNode instanceof Text) && domOffset > 0) { // domOffset>0 ,因此一定存在子元素
      const childNodes = domNode.childNodes;
      const domOffsetSourceIndex = this.getNodeSource_(childNodes[domOffset - 1] as HTMLElement);
      point = domOffsetSourceIndex[1];
    }
    return point;
  }

  /** 根据dom节点获取其源码映射区间 */
  getNodeSource_ (domNode: HTMLElement) {
    const sourceIndex = [0, 0];
    if (domNode instanceof Text) {
      const textL = domNode.length;
      if (domNode.previousElementSibling) {
        const preIndexStr = domNode.previousElementSibling.getAttribute('i');
        if (preIndexStr) {
          const preIndexRange = preIndexStr.split('-');
          sourceIndex[0] = parseInt(preIndexRange[1]);
          sourceIndex[1] = sourceIndex[0] + textL;
        }
      } else if (domNode.parentElement) {
        const parentIndexStr = domNode.parentElement.getAttribute('i');
        if (parentIndexStr) {
          const parentIndexRange = parentIndexStr.split('-');
          sourceIndex[0] = parseInt(parentIndexRange[0]);
          sourceIndex[1] = sourceIndex[0] + textL;
        }
      }
    } else {
      // 有时光标落在了p标签，或者换行产生新空行时,往下找一级
      let indexStr = domNode.getAttribute('i');
      if (!indexStr) {
        const children = domNode.childNodes;
        if (children.length) {
          domNode = children[0] as HTMLElement;
          indexStr = domNode.getAttribute('i');
        }
      }
      if (indexStr) {
        const indexRange = indexStr.split('-');
        sourceIndex[0] = parseInt(indexRange[0]);
        sourceIndex[1] = parseInt(indexRange[1]);
      }
    }
    return sourceIndex;
  }

  /** TODO：考虑增加缓存，优化渲染html时主动触发+被动触发双次触发的问题 */
  showMarker (domSelection: Selection | null) {
    const showMarkerNodes = document.querySelectorAll('.editor-marker:not(.hide)');
    for (let i = 0; i < showMarkerNodes.length; i++) {
      showMarkerNodes[i].setAttribute('class', 'editor-marker hide');
    }
    if (domSelection) {
      let markerNode: HTMLElement | null = domSelection.anchorNode as HTMLElement;
      if (markerNode instanceof Text) {
        markerNode = markerNode.parentNode as HTMLElement;
      }
      while (markerNode) {
        let className = markerNode.getAttribute('class');
        if (className === 'editor-pre') {
          break;
        }
        if (className === 'editor-block') {
          if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].indexOf(markerNode.tagName) > -1) {
            const titleMarker = markerNode.querySelectorAll('.editor-marker.hide');
            for (let i = 0; i < titleMarker.length; i++) {
              titleMarker[i].setAttribute('class', 'editor-marker');
            }
          }
          break;
        }
        if (className !== 'editor-marker hide') {
          if (markerNode.previousSibling) {
            markerNode = markerNode.previousSibling as HTMLElement;
          } else if (markerNode.nextSibling)
          markerNode = markerNode.nextSibling as HTMLElement;
        }
        if (!(markerNode instanceof Text)) {
          className = markerNode.getAttribute('class');
          if (className === 'editor-marker hide') {
            markerNode.setAttribute('class', 'editor-marker');
            const otherMarkerNode = (markerNode.getAttribute('m') === 'before' ? markerNode.nextSibling?.nextSibling : markerNode.previousSibling?.previousSibling) as HTMLElement | null;
            if (otherMarkerNode) {
              otherMarkerNode.setAttribute('class', 'editor-marker');
            }
          } else {
            break;
          }
        }
        markerNode = markerNode.parentNode as HTMLElement | null;
      }
    }
  }

  inDom (tagName: string) {
    const domSelection = window.getSelection();
    if (domSelection) {
      let anchorNode = domSelection.anchorNode as HTMLElement | null;
      while (anchorNode) {
        if (!(anchorNode instanceof Text)) {
          const className = anchorNode.getAttribute('class');
          if (className && className.indexOf('editor-pre') > -1) {
            break;
          }
          if (anchorNode?.tagName.toLowerCase() === tagName) {
            const sourceIndex = this.getNodeSource_(anchorNode);
            return { sourceIndex };
          }
        }
        anchorNode = anchorNode.parentElement;
      }
    }
    return null;
  }

  // TODO 此方法应该被不同渲染模式子类重写
  render () {
    // const parsed = new Parser({smart: true}).parse(this.textModel_.getSpacer());
    // console.error('spacer', this.textModel_.getSpacer())
    // console.error('commonMark-Node', parsed);
    // console.error('commonMark-Html',new HtmlRenderer().render(parsed));
    // console.error('customMark-Node', markdown.md2node(this.textModel_.getSpacer()))
    // console.time('customMark-time')
    // console.error('customMark-Html', markdown.md2html(this.textModel_.getSpacer()))
    // console.timeEnd('customMark-time')
    // this.viewContainer_.innerHTML = this.textModel_.getSpacer()
    this.viewContainer_.innerHTML = markdown.md2html(this.textModel_.getSpacer())
    this.updateDomSelection();
    // this.viewContainer_.scrollTop = this.viewContainer_.scrollHeight;
  }


  dispose () {
    if (this.renderBinder_) {
      this.textModel_.off(TextModel.EVENT_TYPE.TEXT_CHANGE, this.renderBinder_);
      this.renderBinder_ = null;
    }
    // if (this.updateDomSelectionBinder_) {
    //   this.selectionModel_.off(SelectionModel.EVENT_TYPE.SELECTION_CHANGE, this.updateDomSelectionBinder_);
    //   this.updateDomSelectionBinder_ = null;
    // }
    if (this.domSelectionChangeHandlerBinder_) {
      window.document.removeEventListener('selectionchange', this.domSelectionChangeHandlerBinder_);
      this.domSelectionChangeHandlerBinder_ = null;
    }
    this.viewContainer_.innerHTML = '';
  }
}
export default BaseView;