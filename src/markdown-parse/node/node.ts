/*
 * @Description: Mnode，Markdown解析后的AST语法树节点，链表形式（便于插入和删除操作）。与原生的dom类似。
 * @Author: ZengYong
 * @CreateDate: 2021-10-19 19:27:37
 */


export enum NodeType{
  Document = 'document',
  BlockQuote = 'blockQuote',
  List = 'list',
  Item = 'item',
  Paragraph = 'paragraph',
  Head = 'head',
  Table = 'table',
  TableThead = 'tableThead',
  TableTh = 'tableTh',
  TableTbody = 'tableTbody',
  TableTr = 'tableTr',
  TableTd = 'tableTd',
  Emph = 'emph',
  Strong = 'strong',
  Link = 'link',
  Image = 'image',
  CustomInline = 'customInline',
  CustomBlock = 'customBlock',
  CodeBlock = 'codeBlock',
  HtmlBlock = 'htmlBlock',
  ThematicBreak = 'thematicBreak',
  Text = 'text',
  Underline = 'underline',
  Checkbox = 'checkbox',
  Del = 'del',
  Code = 'code',
}



export class MNode {
  type: NodeType;
  parent: MNode | null = null;
  firstChild: MNode | null = null;
  lastChild: MNode | null = null;
  prev: MNode | null = null;
  next: MNode | null = null;
  open: boolean = true;
  stringContent: string = '';
  sourceStart: number;
  sourceEnd: number;
  blockMarkerBefore: string | undefined = ''; // 标识占位符(叶子块需要,目前只有代码块和标题需要，因为其他叶子快内部可以包含p标签)
  blockMarkerAfter: string | undefined = ''; // 标识占位符(叶子块需要,目前只有代码块和标题需要，因为其他叶子快内部可以包含p标签)
  marker: string = ''; // 是否是文本标记符占位节点
  isShow: boolean = true; // 是否需要显示和隐藏（隐藏的话直接不创建dom节点，占位场景）
  // lastLineBlank: boolean = false; // 末尾是否存在空白行，用于换行时容器切换

  constructor (sourceStart: number) {
   this.sourceStart = sourceStart;
  }

  unlink () {
    if (this.prev) {
      this.prev.next = this.next;
    } else if (this.parent) {
      this.parent.firstChild = this.next;
    }
    if (this.next) {
        this.next.prev = this.prev;
    } else if (this.parent) {
        this.parent.lastChild = this.prev;
    }
    this.parent = null;
    this.next = null;
    this.prev = null;
  }

  appendChild (mnode: MNode) {
    mnode.unlink();
    mnode.parent = this;
    if (this.lastChild) {
        this.lastChild.next = mnode;
        mnode.prev = this.lastChild;
        this.lastChild = mnode;
    } else {
        this.firstChild = this.lastChild = mnode;
    }
  }

  prependChild (mnode: MNode) {
    mnode.unlink();
    mnode.parent = this;
    if (this.firstChild) {
        this.firstChild.prev = mnode;
        mnode.next = this.firstChild;
        this.firstChild = mnode;
    } else {
        this.firstChild = mnode;
        this.lastChild = mnode;
    }
  }

  insertAfter (mnode: MNode) {
    mnode.unlink();
    mnode.next = this.next;
    if (mnode.next) {
      mnode.next.prev = mnode;
    }
    mnode.prev = this;
    this.next = mnode;
    mnode.parent = this.parent;
    if (!mnode.next && mnode.parent) {
      mnode.parent.lastChild = mnode;
    }
  }

  insertBefore (mnode: MNode) {
    mnode.unlink();
    mnode.prev = this.prev;
    if (mnode.prev) {
      mnode.prev.next = mnode;
    }
    mnode.next = this;
    this.prev = mnode;
    mnode.parent = this.parent;
    if (!mnode.prev && mnode.parent) {
      mnode.parent.firstChild = mnode;
    }
  }

  setStringContent (stringContent: string) {
    this.stringContent = stringContent;
  }

  getStringContent () {
    return this.stringContent;
  }

  /** 段落延续规则怕判断（当前节点块是否可包含跨行内容,即新的一行能否放入当前块，而不用新建节点） */
  continue (currentLine: string, offset: number, colum: number): any { 
    return null;
  }
  /** 在节点解析关闭时运行。理解为node关闭回调钩子，关闭后需要处理的事务，如html替换掉\n、识别段首链接等 */
  finalize(sourceEnd?: number) {
    this.open = false;
    if (sourceEnd) {
      this.sourceEnd = sourceEnd;
    }
  }

  /** 是否能包含类型为 nodeType 的子块 */
  canContain(mnode: MNode) {
    return false;
  }
}
export default MNode;