/*
 * @Description: 将 md 字符串转换成语法树 doc，当前类主要进行 block 段落级别处理
 * @Author: ZengYong
 * @CreateDate: 2021-09-23 17:44:48
 */

import { DocumentNode, NodeType, ParagraphNode ,SubNode } from "../node";
import BlockCreaterFactory from "../markdown-block-creater/factory";
import { getPreSpacerOrTab } from "../funs";

class MarkdownParserBlock {

  private doc_: DocumentNode; // 语法树
  private sourceIndex_: number; // 整个字符串的当前位置,用于源码映射
  private offset_: number; // 当前行当前处理的字符位置
  private column_: number; // 缩进记录
  private tip_: SubNode; // 当前容器位置
  private blockParseCreater_ = new BlockCreaterFactory().build(); // 块创建器：根据行首字符创建不同的 AST 节点类型（采用责任链模式）
  private currentLine_: string; // 当前正在处理的行
  private nextLine_: string | undefined; // 下一行
  private blank_: boolean; // 当前处理的行最后是否包含了换行符，或者是空行
  private indent_: number; // 当前处理的行最前面有几个空格缩进，tab为4个
  private spaceInTab_: number; // 当前 offset 在 tab 内剩余的空格数
  // private inTable_: boolean = false;

  parse (md: string) {
    this.doc_ = new DocumentNode(0);
    this.tip_ = this.doc_;
    this.sourceIndex_ = 0;
    const lines = md.split(/\r\n|\n|\r/);
    const len = lines.length;
    for (let i = 0; i < len; i++) {
      const line = lines[i];
      this.nextLine_ = lines[i + 1];
      this.parseBlock_(line);
      this.sourceIndex_ += line.length + 1;// + 1是为了模型的换行符，保持模型位置同步，但因为换行符不属于任何一行，所以调用finalize方法时需要 -1。
    }
    // this.sourceIndex_--; // 最后一行的末尾不加1
    while (this.tip_) {
      this.tip_.finalize(this.sourceIndex_ - 1); 
      this.tip_ = this.tip_.parent as SubNode;
    }
    return this.doc_;
  }

  parseBlock_ (line: string) {
    this.offset_ = 0;
    this.column_ = 0;
    this.currentLine_ = line;
    // this.dealSpace_();
    const container = this.beforeParse_();
    if (!container) return;
    this.tip_ = container as SubNode;

    // 根据 MD 规范：代码块、列表和列表项这三种为容器块, 需要继续循环，其他均为叶子
    let createResult;
    // 代码块内部不用进行块解析
    if (container.type !== NodeType.CodeBlock) {
      // let spaceResult;
      do {
        this.dealSpace_();
        createResult = this.blockParseCreater_.create({
          line: line,
          nextLine: this.nextLine_,
          offset: this.offset_,
          column: this.column_,
          container: this.tip_,
          // indent: this.indent_,
          sourceStart: this.sourceIndex_ + this.offset_
        });
        if (createResult) {
          this.addChild_(createResult.mnode);
          this.fixOffsetAndColumn_(createResult.offset, createResult.column, createResult.spaceInTab);
          if (createResult.mnode.type === NodeType.CodeBlock) {
            // 刚生成代码块，不用进行后续逻辑了，避免增加多余的空行
            return;
          }
        }
      } while (createResult && createResult.mnode.isBlockContainer && this.currentLine_[this.offset_]);
    }
    // 代码块刚识别生成后还在第一行，不用添加内容 text
    // if (!createResult || (createResult && createResult.mnode.type !== NodeType.CodeBlock)) {
      if (!this.tip_.canContainText) {
        this.addChild_(new ParagraphNode(this.sourceIndex_ + this.offset_));
      }
      this.addLineText_();

      // if (this.blank_ && container.type === NodeType.Item) {
      //   container.lastLineBlank = true;
      // }
    // }
  }

  /** 检测段落延续，延续段落不需要新建节点，同时跳过对应的offset,相当于预处理一些工作 */
  beforeParse_ () {
    let container: SubNode = this.doc_;
    const lineIndent = this.dealSpace_();
    this.indent_ = lineIndent;
    while (container) {
      if (!container.open) {
        container = container.parent as SubNode;
        break;
      }
      const continueResult = container.continue(this.currentLine_, this.offset_, this.column_);
      if (continueResult) {
        // 预处理时可能需要变更指针，同时也就改变了下一次的dealSpace_计算indent结果
        this.fixOffsetAndColumn_(continueResult.offset, continueResult.column, continueResult.spaceInTab);
        if (continueResult.end) {
          container.finalize(this.sourceIndex_ + this.offset_);
          // this.tip_ = this.tip_.parent as SubNode; // 会导致底层的tip绕过finalize，如container是thread，但tip是其子元素tr时，这里tip不用此时立即更新，而是走下一行循环进入此方法底部的while判断即可
          return;
        }
        if (container.lastChild) {
          container = container.lastChild as SubNode;
          this.dealSpace_();
        } else {
          break;
        }
      } else {
        container = container.parent as SubNode;
        break;
      }
    }
    // 结束未匹配到的底层节点
    while (container !== this.tip_) {
      this.tip_.finalize(this.sourceIndex_ - 1);
      this.tip_ = this.tip_.parent as SubNode;
    }
    return container;
  }

  addChild_ (mnode: SubNode) {
    while (!this.tip_.canContain(mnode)) {
      this.tip_.finalize(this.sourceIndex_ - 1);
      this.tip_ = this.tip_.parent as SubNode;
    }
    this.tip_.appendChild(mnode);
    let lastChild: SubNode | null = mnode;
    while (lastChild) {
      this.tip_ = lastChild;
      lastChild = lastChild.lastChild as SubNode | null
    }
  }

  dealSpace_ () {
    const currentLine = this.currentLine_;
    let c;
    // let offset = this.offset_;
    let column = this.column_;
    while ((c = currentLine.charAt(this.offset_)) !== "") {
      if (c === " ") { // 空格
        this.offset_++;
        this.column_++;
      } else if (c === "\t") { // tab
        this.offset_++;
        this.column_ += 4 - (this.column_ % 4);
      } else {
        break;
      }
    }
    this.blank_ = c === "\n" || c === "\r" || c === "";
    return this.column_ - column;
    // this.indent_ = column - this.column_;
    // return { offset, column }
  }

  fixOffsetAndColumn_ (offset: number, column: number, spaceInTab: number) {
    if (offset > -1) {
      this.offset_ = offset;
    }
    if (column > -1) {
      this.column_ = column;
    }
    if (spaceInTab > -1) {
      this.spaceInTab_ = spaceInTab;
    }
  }

  addLineText_ () {
    let stringContent = this.tip_.getStringContent() || '';
    if (this.spaceInTab_) { // 表示当前处于一个tab内部（一个tab 4个空格）
      this.offset_ += 1; // 补齐一个tab的空格
      // add space characters:
      const charsToTab = 4 - (this.column_ % 4);
      stringContent += " ".repeat(charsToTab);
    }
    // 代码块内部没有用标签换行，所以需要用字符换行。但是第一行的前面不能加换行
    if (this.tip_.type === NodeType.CodeBlock) {
      // console.error('stringContent', stringContent, stringContent.length)
      stringContent += this.currentLine_; // 代码块保留整行内容，包括行首空格
      stringContent += '\n';
    } else if (this.tip_.type === NodeType.Paragraph && this.tip_.parent?.type === NodeType.Document) {
       // TODO 普通段落标签保留整行内容，包括行首空格，并修改源码坐标映射（待优化）
      stringContent += this.currentLine_;
      this.tip_.sourceStart = this.sourceIndex_;
    } else {
      stringContent += this.currentLine_.slice(this.offset_);
    }
    this.tip_.setStringContent(stringContent);
  }
}
export default MarkdownParserBlock;