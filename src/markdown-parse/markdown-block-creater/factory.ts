
/*
 * @Description: 责任链工厂，build返回用于创建块节点的处理器。责任链是可复用的，不用解析每行时都重新实例化。
 * @Author: ZengYong
 * @CreateDate: 2021-10-20 18:06:03
 */
import AtxHeadingCreater from "./atx-heading-creater";
import BlockQuoteCreater from "./block-quote-creater";
import FencedCodeBlockCreater from "./fenced-code-block-creater";
import HtmlBlockCreater from "./html-block-creater";
import IndentedCodeBlockCreater from "./indented-code-block-creater";
import ListItemCreater from "./list-item-creater";
import SetextHeadingCreater from "./setext-heading-creater";
import ThematicBreakCreater from "./thematic-break-creater";
import TableCreater from "./table-creater";

export class Factory {
  build () {
    const atxHeadingCreater = new AtxHeadingCreater();
    const blockQuoteCreater = new BlockQuoteCreater();
    const fencedCodeBlockCreater = new FencedCodeBlockCreater();
    const htmlBlockCreater = new HtmlBlockCreater();
    const indentedCodeBlockCreater = new IndentedCodeBlockCreater();
    const listItemCreater = new ListItemCreater();
    const setextHeadingCreater = new SetextHeadingCreater();
    const thematicBreakCreater = new ThematicBreakCreater();
    const tableCreater = new TableCreater();

    atxHeadingCreater.setNext(blockQuoteCreater);
    blockQuoteCreater.setNext(fencedCodeBlockCreater);
    fencedCodeBlockCreater.setNext(htmlBlockCreater);
    htmlBlockCreater.setNext(indentedCodeBlockCreater);
    indentedCodeBlockCreater.setNext(listItemCreater);
    listItemCreater.setNext(setextHeadingCreater);
    setextHeadingCreater.setNext(thematicBreakCreater);
    thematicBreakCreater.setNext(tableCreater);
    return atxHeadingCreater;
  }
}
export default Factory;