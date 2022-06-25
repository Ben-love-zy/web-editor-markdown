/*
 * @Description: Markdown 单例转换类，用于 字符串、vdom(node)、html等互转
 * @Author: ZengYong
 * @CreateDate: 2021-09-23 17:44:48
 */

import MarkdownParserBlock from "./markdown-parser-block";
import MarkdownParserLine from "./markdown-parser-line";
import MarkdownRender from "./markdown-render";
import { SubNode, NodeType } from "./node";
import MTreeWalker from "./tree-walker";

class Markdown {

  /** 块解析 */
  private parseBlock_ (md: string) {
    return new MarkdownParserBlock().parse(md);
  }

  /** 行解析 */
  private parseLine_ (block: SubNode) {
    const walker = new MTreeWalker(block);
    let current;
    while (current = walker.next()) {
      if (!current.close && current.mnode.canContainText) {
        new MarkdownParserLine().parse(current.mnode);
      }
    }
    return block;
  }

  /** markdown 字符串转 html */
  md2html (md: string) {
    return new MarkdownRender().render(this.md2node(md));
  }

  /** markdown 字符串转语法树 */
  md2node (md: string) {
    return this.parseLine_(this.parseBlock_(md))
  }

}
export default new Markdown();