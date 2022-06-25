/*
 * @Description: 进行单行内的语法解析
 * @Author: ZengYong
 * @CreateDate: 2021-10-20 15:18:48
 */

import { SubNode, TextNode, EmphNode, StrongNode, DelNode, ImageNode, LinkNode, HeadNode, NodeType, TableTdNode, TableThNode, TableTheadNode, TableTrNode, TableNode, CheckboxNode, ItemNode, HtmlBlockNode, CodeNode } from "../node";
import { reHtmlTag } from './common';
import DelimitersStack from "./delimiter-stack";

class MarkdownParserLine {

  private block_: SubNode;
  private line_: string;
  private sourceStart_: number;
  private offset_: number; // 当前处理的字符位置
  private delimiter_: DelimitersStack | null = null;
  private aligns_: string[] = []; // table中的对齐方向
  static whiteSpaceReg = /^\s/; // 空格 tab等
  // static textReg = /^[^\n`\[\]\\!<&*_~'"]+/m; // 普通文本
  static textReg = /^[^\[\]\|\\<!*_~`]+/m; // 普通文本
  static spnlReg = /^\s*(?:\n*)?/;

  parse (mnode: SubNode) {
    this.block_ = mnode;
    this.setBlockMarkerBefore_();
    this.line_ = mnode.stringContent || '';
    // 表格下一个空白行不显示，避免后续输入被表格继承
    if (this.line_.length === 0 && this.block_.prev?.type === NodeType.Table) {
      this.block_.isShow = false;
      return;
    }
    this.offset_ = 0;
    this.delimiter_ = null;
    this.parseLine_();
    this.transNormal_(null);
    this.setBlockMarkerAfter_();
  }

  parseLine_ () {
    if (this.block_.type === NodeType.CodeBlock) {
      this.block_.appendChild(new TextNode(this.sourceStart_ + 1, this.line_));
      return;
    }
    if (!this.line_) {
      this.block_.appendChild(new TextNode(this.sourceStart_, ''));
      return;
    }
    if (this.block_.type === NodeType.TableTr) {
      const tableNode = (this.block_.parent as SubNode).parent as TableNode;
      this.aligns_ = [...tableNode.aligns];
    }
    const parent = this.block_.parent;
    if (parent && parent instanceof ItemNode && parent.listType === 'bullet') {
      const matchCheckbox = this.line_.match(/^\[(?:[x X])\]\s+/);
      if (matchCheckbox) {
        parent.listStyle = 'none';
        const matchStr = matchCheckbox[0];
        const checkboxNode = new CheckboxNode(this.sourceStart_, matchStr.indexOf('[ ]') === -1);
        this.block_.appendChild(checkboxNode);
        this.offset_ += matchStr.length - 1; // -1 是为了把空格显示出来，防止光标紧贴checkbox
        checkboxNode.finalize(this.sourceStart_ + this.offset_);
      }
    }
    let char: string;
    while (char = this.line_[this.offset_]) {
      switch (char) {
        case '*':
        case '_':
        case '~':
          this.parseNormal_(char);
          break;
        case '[':
          this.parseOpenBracket_();
          break;
        case ']':
          this.parseCloseBracket_();
          break;
        case '!':
          this.parseExclamatory_();
          break;
        case '|':
          this.parseVertical_();
          break;
        case '\\':
          this.parseBackslash_();
          break;
        case '<':
          this.parseHtmlTag_();
          break;
        case '`':
          this.parseBackticks_();
          break;
        default:
          this.parseText_();
          break;
      }
    }
    // 将表格的td数量与标头补充齐全
    while (this.aligns_.length) {
      this.parseVertical_();
    }
  }

  /** 普通文本内容 */
  parseText_ () {
    const matchText = this.match_(MarkdownParserLine.textReg);
    if (matchText) {
      this.block_.appendChild(new TextNode(this.sourceStart_ + this.offset_ - matchText.length, matchText));
    }
  }

  /** 加粗、斜体、删除线 */
  parseNormal_ (char: string) {
    let count = 0;
    let startPos = this.offset_;
    let canOpen = false;
    let canClose = false;
    
    while (this.line_[this.offset_] === char) {
      count++;
      this.offset_++;
    }
    // 整体参照 CM 规范的开闭原则，不过这里不做标点符合限制
    if (this.line_[this.offset_] && !MarkdownParserLine.whiteSpaceReg.test(this.line_[this.offset_])) {
      canOpen = true;
    }
    if (startPos > 0 && !MarkdownParserLine.whiteSpaceReg.test(this.line_[startPos - 1])) {
      canClose = true;
    }
    this.stackPush_(this.line_.substr(startPos, count), char, count, canOpen, canClose);
  }

  /** 转换节点，将分隔符节点转换为对应的实际节点，根据 CM 规范找出 opener 和 closer 并依次处理。stackBottom 是为了提高性能排除不必要的访问 */
  transNormal_ (stackBottom: DelimitersStack | null) {
    // closer 先设定为栈底，然后往上找最近的满足条件的
    let closer = this.delimiter_;
    let opener = null;
    let openerBottom = {};
    while (closer !== null && closer.pre !== stackBottom) {
        closer = closer.pre;
    }
    while (closer) {
      const char = closer.char;
      if (!closer.canClose || !(char === '*' || char === '_' || char === '~')) {
        closer = closer.next;
      } else {
        opener = this.transNormalOpener_(closer, openerBottom[closer.char] || stackBottom);
        // 未匹配到opener，则closer后移。
        if (!opener) {
          const oldCloser = closer;
          closer = closer.next;

          // 用于算法优化：针对某个closer，若没有找到opener，则标识一下，下次再遇到相同的closer，就匹配到标识处位置即可，不用遍历到栈底。
          openerBottom[oldCloser.char] = oldCloser.pre;

          // 如果没有发现匹配的opener，并且当前closer也不能作为其他的opener，则从栈中移除此closer
          if (!oldCloser.canOpen) {
            if (this.delimiter_ === oldCloser) {
              this.delimiter_ = oldCloser.pre;
            }
            oldCloser.remove();
          }
        } else {
          // 找到opener和closer后，根据分隔符创建新的节点，把opener和closer之间的原有内容，包含到新的节点中去
          let transNode: SubNode;
          let useCount: number;
          const openerNode = opener.mnode;
          const closerNode = closer.mnode;
          if (char === '*' || char === '_') {
            if (opener.currentCount >= 2 && closer.currentCount >= 2) {
              useCount = 2;
              transNode = new StrongNode(openerNode.sourceEnd);
            } else {
              useCount = 1;
              transNode = new EmphNode(openerNode.sourceEnd);
            }
          } else {
            useCount = 1;
            transNode = new DelNode(openerNode.sourceEnd);
          }
          transNode.finalize(closerNode.sourceStart);
          // 删除已经消耗掉的分隔符
          opener.currentCount -= useCount;
          openerNode.sourceEnd -= useCount;
          closer.currentCount -= useCount;
          closerNode.sourceStart += useCount;
          openerNode.text = openerNode.text.slice(useCount);
          closerNode.text = closerNode.text.slice(useCount);
          // 把opener和closer之间的原有内容，包含到新的节点中去
          let betweenNode = openerNode.next;
          let next;
          while (betweenNode && betweenNode !== closerNode) {
            next = betweenNode.next;
            // betweenNode.unlink();
            transNode.appendChild(betweenNode);
            betweenNode = next;
          }
          // 将转换后的新节点插入语法树中
          openerNode.insertAfter(transNode);
          let marker = char.repeat(useCount);
          this.addMarkerNode_(transNode, marker, marker);
 
          // opener和closer之间的分隔符将作为普通文本显示，没有机会去匹配转换了，因此从链表中移除
          DelimitersStack.removeBetween(opener, closer);

          // 分隔符被消耗后，剩余分隔符数量为0时，语法树中的节点和分隔符栈中节点都没必要存在了
          if (opener.currentCount === 0) {
            opener.remove();
            openerNode.unlink();
          }
          if (closer.currentCount === 0) {
            // closer 需要后移，用于下次循环
            const nextCloser = closer.next;
            if (this.delimiter_ === closer) {
              this.delimiter_ = closer.pre;
            }
            closer.remove();
            closer = nextCloser;
            closerNode.unlink();
          }
        }
      }
    }
  }

  transNormalOpener_ (closer: DelimitersStack, stackBottom: DelimitersStack) {
    let opener = closer.pre;
    while (opener && opener !== stackBottom) {
      if (opener.canOpen && opener.char === closer.char) {
        return opener;
      } else {
        opener = opener.pre;
      }
    }
    return null;
  }

  parseOpenBracket_ () {
    let char = '[';
    this.offset_++;
    this.stackPush_(char, char, 1, true, false);
  }

  parseCloseBracket_ () {
    let opener = this.delimiter_;
    let isImage = false;
    // 优化点：这里如果新起一个栈表示括号符号，而不是复用普通分隔符栈，则可以省掉此循环查找
    while (opener) {
      if (opener.char === '[') {
        break;
      }
      if (opener.char === '![') {
        isImage = true;
        break;
      }
      opener = opener.pre;
    }
    // 未找到对应opener，直接插入普通文本节点。若中括号之间没有内容，则也不匹配（CM规范没有这一项）
    //if (!opener || this.line_[this.offset_ - 1] === '[') {

    // 未找到对应opener，直接插入普通文本节点。
    if (!opener) {
      this.block_.appendChild(new TextNode(this.sourceStart_ + this.offset_, ']'));
      return;
    }

    this.offset_++;

    let matched = false; // 是否能匹配成功
    let startPos = this.offset_; // 万一匹配失败，需要将坐标恢复
    let dest = '';
    if (this.line_[this.offset_] === '(') {
      this.offset_++;
      let char;
      // 清除前面的空格(先注释，除非将数据模型中的对应位置也清除掉，否则这里清除后会导致 marker 的 source 计算不正确，Typora 也没有清除)
      // this.match_(MarkdownParserLine.spnlReg);
      while (char = this.line_[this.offset_])  {
        this.offset_++;
        // if (char === ' ') { // 连接中不能有空格(CM 规范有，但 Typora 没有遵循)，这里注释，因为我们也没有清除前面的空格
        //   // break;
        // } else if (char !== ')') {
        //   dest += char;
        // } else if (char === ')') {
        //   matched = true;
        //   break;
        // }
        if (char !== ')') {
          dest += char;
        } else {
          matched = true;
          break;
        }
      }
    }
    if (matched) {
      const mnnode = isImage ? new ImageNode(opener.mnode.sourceEnd, dest) : new LinkNode(opener.mnode.sourceEnd, dest);
      let betweenNode = opener.mnode.next;
      let next;
      while (betweenNode) {
        next = betweenNode.next;
        betweenNode.unlink();
        mnnode.appendChild(betweenNode);
        betweenNode = next;
      }
      this.block_.appendChild(mnnode);
      // 对 [] 之间的内容进行普通分隔符解析,此时的解析位置是在 ]，所以以 [ 之前的节点为栈底即可
      this.transNormal_(opener.pre);
      mnnode.finalize(this.sourceStart_ + startPos - 1);
      this.addMarkerNode_(mnnode, opener.char, '](' + dest + ')');
      if (this.delimiter_ === opener) {
        this.delimiter_ = opener.pre;
      }
      opener.remove();
      opener.mnode.unlink();

      // 防止链接套链接，将openr以前的括号都从栈中移除
      if (!isImage) {
        opener = this.delimiter_;
        while (opener) {
          const pre = opener.pre;
          if (opener.char === '[') {
            opener.remove();
          }
          opener = pre;
        }
      }
    } else {
      if (this.delimiter_ === opener) {
        this.delimiter_ = opener.pre;
      }
      opener.remove();
      this.offset_ = startPos;
      this.block_.appendChild(new TextNode(this.sourceStart_ + this.offset_ - 1, ']'));
    }
  }

  parseExclamatory_ () {
    this.offset_++;
    if (this.line_[this.offset_] === '[') {
      const char = '![';
      this.offset_++;
      this.stackPush_(char, char, 2, true, false);
    } else {
      this.block_.appendChild(new TextNode(this.sourceStart_ + this.offset_ - 1, '!'));
    }
  }

  parseVertical_ () {
    if (this.block_.type !== NodeType.TableTr) {
      if (this.line_[this.offset_]) {
        this.block_.appendChild(new TextNode(this.sourceStart_ + this.offset_, '|'));
        this.offset_++;
      }
      return;
    }
    if (this.line_[this.offset_]) {
      this.offset_++;
    }
    let opener = this.delimiter_;
    while (opener) {
      if (opener.char === '|') {
        break;
      }
      opener = opener.pre;
    }
    // 表格th、td针对缺省最后一个竖线时的兼容处理
    // if (checkLastTd && this.line_[this.offset_ - 1] === '|') {
    //   if (opener) {
    //     if (this.delimiter_ === opener) {
    //       this.delimiter_ = opener.pre;
    //     }
    //     opener.remove();
    //     opener.mnode.unlink();
    //   }
    //   return;
    // }
    let sourceStart;
    let betweenNode;
    let matched = false;
    if (opener) {
      sourceStart = opener.mnode.sourceEnd;
      betweenNode = opener.mnode.next;
      matched = true;
    } else if (this.block_.lastChild) {
      sourceStart = (this.block_.firstChild as SubNode).sourceStart;
      betweenNode = this.block_.firstChild;
      matched = true;
    }
    if (matched) {
      const mnnode = (this.block_ as TableTrNode).isheader ? new TableThNode(sourceStart as number, this.aligns_.shift() || 'left') : new TableTdNode(sourceStart as number, this.aligns_.shift() || 'left');
      let next;
      while (betweenNode) {
        next = betweenNode.next;
        betweenNode.unlink();
        mnnode.appendChild(betweenNode);
        betweenNode = next;
      }
      this.block_.appendChild(mnnode);
      // 对 td 的内容进行普通分隔符解析
      this.transNormal_(opener);
      mnnode.finalize(this.sourceStart_ + this.offset_ - 1);
      if (opener) {
        // TODO 此判断可封装，待优化
        if (this.delimiter_ === opener) {
          this.delimiter_ = opener.pre;
        }
        opener.remove();
        opener.mnode.unlink();
      }
    }
    if (this.aligns_.length) {
      const char = '|';
      this.stackPush_(char, char, 1, true, true);
    } else {
      this.offset_ = this.line_.length;
    }
  }

  parseBackslash_ () {
    this.offset_++;
    const nextChar = this.line_[this.offset_];
    const reg = new RegExp("^[!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]");
    if (reg.test(nextChar)) {
      const textNode = new TextNode(this.sourceStart_ + this.offset_, nextChar);
      this.block_.appendChild(textNode);
      this.addMarkerNode_(textNode, '\\');
      this.offset_++;
    } else {
      this.block_.appendChild(new TextNode(this.sourceStart_ + this.offset_ - 1, '\\'));
    }
  }

  parseHtmlTag_ () {
    const match = this.line_.slice(this.offset_).match(reHtmlTag);
    if (match) {
      const isCloseTag = match[0].indexOf('</') === 0;
      // TODO 先不解析html内容
      const htmlBlockNode = new HtmlBlockNode(this.sourceStart_ + this.offset_, match[0], isCloseTag);
      this.block_.appendChild(htmlBlockNode);
      this.offset_ += match[0].length;
      htmlBlockNode.finalize(this.sourceStart_ + this.offset_);
    //   let sourceStart: number;
    //   if (isCloseTag) {
    //     sourceStart = this.sourceStart_ + this.offset_
    //   } else {
    //     sourceStart = this.sourceStart_ + this.offset_ + match[0].length;
    //   }
    //   this.offset_ += match[0].length;
    //   const htmlNode = new HtmlBlockNode(sourceStart, match[0], isCloseTag);
    //   this.block_.appendChild(htmlNode);
    //   htmlNode.finalize(sourceStart); // html 节点渲染时没有可视字符，所以不占用源码坐标，由marker去占位
    //   if (isCloseTag) {
    //     this.addMarkerNode_(htmlNode, '', match[0]);
    //   } else {
    //     this.addMarkerNode_(htmlNode, match[0]);
    // } 
    } else {
      this.block_.appendChild(new TextNode(this.sourceStart_ + this.offset_, '<'));
      this.offset_++;
    }
  }

  /** 行内代码 */
  parseBackticks_ () {
    let match = this.line_.slice(this.offset_).match(/^`+/);
    // 这里的match一定是真，因为检测到`才进入此方法的，即不需要else逻辑
    if (match) {
      const startMatch = match[0];
      this.offset_ += startMatch.length;
      let startPos = this.offset_;
      while (match = this.line_.slice(this.offset_).match(/`+/)) {
        this.offset_ += match.index as number + match[0].length;
        if (match[0] === startMatch) {
          const codeContent = this.line_.slice(startPos, this.offset_ - match[0].length);
          const codeNode = new CodeNode(this.sourceStart_ + startPos, codeContent);
          codeNode.finalize(this.sourceStart_ + this.offset_ - match[0].length);
          this.block_.appendChild(codeNode);
          this.addMarkerNode_(codeNode, startMatch, startMatch);
          return;
        }
      }
      // 行内代码解析失败，按普通文本处理
      this.block_.appendChild(new TextNode(this.sourceStart_ + startPos - startMatch.length, startMatch));
      this.offset_ = startPos;
    }
  }

  // 分隔符入栈，并更新栈顶
  stackPush_ (text: string, char: string, count: number, canOpen: boolean, canClose: boolean) {
    const textNode = new TextNode(this.sourceStart_ + this.offset_ - count, text);
    this.block_.appendChild(textNode);
    if (canOpen || canClose) {
      const delimiter_ = new DelimitersStack(char, count, textNode, canOpen, canClose);
      if (this.delimiter_) {
        this.delimiter_.next = delimiter_;
        delimiter_.pre = this.delimiter_;
      }
      this.delimiter_ = delimiter_;
    }
  }

  /** 对当前block节点进行marker设置补充，如标题 */
  setBlockMarkerBefore_ () {
    const blockMarkerBefore = this.block_.blockMarkerBefore;
    if (blockMarkerBefore) {
      const markerNode = new TextNode(this.block_.sourceStart, blockMarkerBefore);
      markerNode.marker = 'before';
      this.block_.appendChild(markerNode);
      this.sourceStart_ = markerNode.sourceEnd;
    } else {
      this.sourceStart_ = this.block_.sourceStart;
    }
  }

  setBlockMarkerAfter_ () {
    const blockMarkerAfter = this.block_.blockMarkerAfter;
    if (blockMarkerAfter) {
      const markerNode = new TextNode(this.block_.sourceEnd - blockMarkerAfter.length, blockMarkerAfter);
      markerNode.marker = 'after';
      this.block_.appendChild(markerNode);
    }
  }

  addMarkerNode_ (originNode: SubNode, markerBefore?: string, markerAfter?: string) {
    if (markerBefore) {
      const markerNodeBefore = new TextNode(originNode.sourceStart - markerBefore.length, markerBefore);
      markerNodeBefore.marker = 'before';
      originNode.insertBefore(markerNodeBefore);
    }
    if (markerAfter) {
      const markerNodeAfter = new TextNode(originNode.sourceEnd, markerAfter);
      markerNodeAfter.marker = 'after';
      originNode.insertAfter(markerNodeAfter);
    }
  }

  match_ (reg: RegExp) {
    const match = reg.exec(this.line_.slice(this.offset_));
    if (match) {
      this.offset_ += match[0].length;
      return match[0];
    } else {
      return null;
    }
  }

}
export default MarkdownParserLine;