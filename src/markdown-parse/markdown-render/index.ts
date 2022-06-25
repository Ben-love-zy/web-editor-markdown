/*
 * @Description: 将语法树 AST doc 转换为 HTML 渲染
 * @Author: ZengYong
 * @CreateDate: 2021-10-20 15:19:48
 */

import { SubNode } from "../node";
import HtmlGenerate from "./html-generate";
import MTreeWalker from "../tree-walker";

class MarkdownRender {

  render (mnode: SubNode, htmlGenerate?: HtmlGenerate) {
    if (!htmlGenerate) {
      htmlGenerate = new HtmlGenerate();
    }
    const walker = new MTreeWalker(mnode);
    let buffer = '';
    let current;
    while (current = walker.next()) {
      if (htmlGenerate[current.mnode.type]) {
        buffer = htmlGenerate[current.mnode.type](buffer, current.mnode, current.close) || '';
      }
    }
    return buffer;
  }
}
export default MarkdownRender;