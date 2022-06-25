/*
 * @Description: 根据节点生成对应的html标签
 * @Author: ZengYong
 * @CreateDate: 2021-10-27 18:13:27
 */
import { NodeType , BlockQuoteNode, CodeBlockNode, DocumentNode, EmphNode, HeadNode, HtmlBlockNode, ImageNode, LinkNode, ListNode, ItemNode, ParagraphNode, StrongNode, TextNode, ThematicBreakNode, DelNode, UnderlineNode, SubNode, TableThNode, TableNode, TableTheadNode, TableTrNode, TableTdNode, TableTbodyNode, CheckboxNode, CodeNode } from "../node";
import { escapeXml } from "../funs";
export class HtmlGenerate {

  createTag_ (tagName: string, attrs?: string[][], selfClosing?: boolean) {
    let buffer = `<${tagName}`;
    if (attrs) {
      for (let attr of attrs) {
        buffer += ` ${attr[0]}="${attr[1]}"`;
      }
    }
    if (selfClosing) {
      buffer += ' /';
    }
    buffer += '>';
    return buffer;
  }

  /** 设置源码映射对应的坐标 */
  getSource_ (mnode: SubNode, attrs: string[][] = []) {
    attrs.push(['i', String(mnode.sourceStart || 0) + '-' + String(mnode.sourceEnd || 0)]);
    if (mnode.isParagraph) {
      attrs.push(['class', 'editor-block'])
    }
    return attrs;
  }

  [NodeType.BlockQuote] (buffer: string, mnode: BlockQuoteNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/blockquote');
    } else {
      buffer += this.createTag_('blockquote', this.getSource_(mnode));
    }
    return buffer;
  }

  [NodeType.CodeBlock] (buffer: string, mnode: CodeBlockNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/code');
      buffer += this.createTag_('/pre');
    } else {
      const source = this.getSource_(mnode);
      for (let item of source) {
        if (item[0] === 'class') {
          item[1] += ' code-block';
          break;
        }
      }
      buffer += this.createTag_('pre', source);
      buffer += this.createTag_('code', source);
    }
    // const source = this.getSource_(mnode);
    // buffer += this.createTag_('pre', source);
    // buffer += this.createTag_('code', source);
    // buffer += mnode.stringContent;
    // buffer += this.createTag_('/code');
    // buffer += this.createTag_('/pre');
    return buffer;
  }

  [NodeType.Emph] (buffer: string, mnode: EmphNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/em');
    } else {
      buffer += this.createTag_('em', this.getSource_(mnode));
    }
    return buffer;
  }

  [NodeType.Head] (buffer: string, mnode: HeadNode, close?: boolean) {
    const tagName = "h" + mnode.level;
    if (close) {
      buffer += this.createTag_('/' + tagName);
    } else {
      buffer += this.createTag_(tagName, this.getSource_(mnode));
    }
    return buffer;
  }

  [NodeType.HtmlBlock] (buffer: string, mnode: HtmlBlockNode, close?: boolean) {
    // TODO 先暂时不显示html效果，因为源码映射时 html已经不占用source了，这里i属性区间会有问题
    // let htmlContent = mnode.htmlContent;
    // if (!mnode.isCloseTag) {
    //   const len = htmlContent.length;
    //   htmlContent = `${htmlContent.slice(0, len - 1)} i="${mnode.sourceStart}-${mnode.sourceEnd}" >`;
    // }
    // buffer += htmlContent;

    // TODO 暂时将html作为普通文本显示
    buffer += escapeXml(mnode.htmlContent);
    return buffer;
  }

  [NodeType.Image] (buffer: string, mnode: ImageNode, close?: boolean) {
    // if (!close) {
    //   buffer += '<img src="' + escapeXml(mnode.src) + '" alt="';
    // } else {
    //   buffer += '" />';
    // }
    if (!close) {
      const attrs = [['src', escapeXml(mnode.src)]];
      let imgStr = this.createTag_('img', this.getSource_(mnode, attrs));
      imgStr = imgStr.substr(0, imgStr.length - 1);
      imgStr += ' alt="';
      buffer += imgStr;
    } else {
      buffer += '" />';
    }
    return buffer;
  }

  [NodeType.Link] (buffer: string, mnode: LinkNode, close?: boolean) {
    const attrs = [['href', mnode.href]];
    if (close) {
      buffer += this.createTag_('/a');
    } else {
      buffer += this.createTag_('a', this.getSource_(mnode, attrs));
    }
    return buffer;
  }

  [NodeType.List] (buffer: string, mnode: ListNode, close?: boolean) {
    const tagName = mnode.listType === 'bullet' ? 'ul' : 'ol';
    if (close) {
      buffer += this.createTag_('/' + tagName);
    } else {
      const attrs: string[][] = [];
      if (tagName === 'ol') {
        attrs.push(['start', mnode.start]);
      }
      buffer += this.createTag_(tagName, attrs);
    }
    return buffer;
  }

  [NodeType.Item] (buffer: string, mnode: ItemNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/li');
    } else {
      const source = this.getSource_(mnode);
      if (mnode.listStyle === 'none') {
        for (let item of source) {
          if (item[0] === 'class') {
            item[1] += ' list-style-none';
            break;
          }
        }
      }
      buffer += this.createTag_('li', source);
    }
    return buffer;
  }

  [NodeType.Paragraph] (buffer: string, mnode: ParagraphNode, close?: boolean) {
    if (mnode.isShow) {
      if (close) {
        buffer += this.createTag_('/p');
      } else {
        buffer += this.createTag_('p', this.getSource_(mnode));
      }
    }
    return buffer;
  }

  [NodeType.Strong] (buffer: string, mnode: StrongNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/strong');
    } else {
      buffer += this.createTag_('strong', this.getSource_(mnode));
    }
    return buffer;
  }

  [NodeType.Text] (buffer: string, mnode: TextNode, close?: boolean) {
    if (mnode.marker) {
      const attrs = [['class', `editor-marker hide`], ['m', mnode.marker]];
      buffer += this.createTag_('span', this.getSource_(mnode, attrs)) + escapeXml(mnode.text);
      buffer += this.createTag_('/span');
    } else {
      buffer += mnode.text;
    }
    return buffer
    // buffer += this.createTag_('span', this.getSource_(mnode)) + mnode.text + this.createTag_('/span');
    // return buffer;
  }

  [NodeType.ThematicBreak] (buffer: string, mnode: ThematicBreakNode, close?: boolean) {
    buffer += this.createTag_('hr', this.getSource_(mnode), true);
    return buffer;
  }

  [NodeType.Del] (buffer: string, mnode: DelNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/del');
    } else {
      buffer += this.createTag_('del', this.getSource_(mnode));
    }
    return buffer;
  }

  [NodeType.Underline] (buffer: string, mnode: UnderlineNode, close?: boolean) {
    // TODO
    return buffer;
  }

  [NodeType.Table] (buffer: string, mnode: TableNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/table');
    } else {
      buffer += this.createTag_('table', this.getSource_(mnode));
    }
    return buffer;
  }

  [NodeType.TableThead] (buffer: string, mnode: TableTheadNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/thead');
    } else {
      buffer += this.createTag_('thead', this.getSource_(mnode));
    }
    return buffer;
  }

  [NodeType.TableTr] (buffer: string, mnode: TableTrNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/tr');
    } else {
      buffer += this.createTag_('tr', this.getSource_(mnode));
    }
    return buffer;
  }

  [NodeType.TableTh] (buffer: string, mnode: TableThNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/th');
    } else {
      const attrs = [['align', mnode.align]];
      buffer += this.createTag_('th', this.getSource_(mnode, attrs));
    }
    return buffer;
  }

  [NodeType.TableTbody] (buffer: string, mnode: TableTbodyNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/tbody');
    } else {
      buffer += this.createTag_('tbody', this.getSource_(mnode));
    }
    return buffer;
  }

  [NodeType.TableTd] (buffer: string, mnode: TableTdNode, close?: boolean) {
    if (close) {
      buffer += this.createTag_('/td');
    } else {
      const attrs = [['align', mnode.align]];
      buffer += this.createTag_('td', this.getSource_(mnode, attrs));
    }
    return buffer;
  }

  [NodeType.Checkbox] (buffer: string, mnode: CheckboxNode, close?: boolean) {
    const attrs: string[][] = [['type', 'checkbox']];
    if (mnode.checked) {
      attrs.push(['checked', 'checked'])
    }
    buffer += this.createTag_('input', this.getSource_(mnode, attrs), true);
    return buffer;
  }

  [NodeType.Code] (buffer: string, mnode: CodeNode, close?: boolean) {
    const source = this.getSource_(mnode, [['class', 'code-block-inline']]);
    buffer += this.createTag_('code', source);
    buffer += mnode.content;
    buffer += this.createTag_('/code');
    return buffer;
  }

}
export default HtmlGenerate;