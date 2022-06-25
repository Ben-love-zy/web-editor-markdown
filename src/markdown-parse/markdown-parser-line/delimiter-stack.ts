/*
 * @Description: 分隔符栈，记录所有分隔符基本信息。用于进行匹配后续匹配配对
 * @Author: ZengYong
 * @CreateDate: 2021-10-26 18:39:39
 */
import { TextNode } from "../node";
export class DelimitersStack {
  char: string; // 分隔符号，*、_、~等
  count: number; // 符号总共数量
  currentCount: number; // 当前还剩余的符号数量
  mnode: TextNode; // 关联的节点
  pre: DelimitersStack | null = null; // 上一个分隔符
  next: DelimitersStack | null = null; // 下一个分隔符
  canOpen: boolean; // 能否作为开始符
  canClose: boolean; // 能否作为结束符

  constructor (char: string, count: number, mnode: TextNode, canOpen: boolean, canClose: boolean) {
    this.char = char;
    this.count = count;
    this.currentCount = count;
    this.mnode = mnode;
    this.canOpen = canOpen;
    this.canClose = canClose;
  }

  /** 删除区间对象 */
  static removeBetween (bottom: DelimitersStack, top: DelimitersStack) {
    if (bottom.next !== top) {
      bottom.next = top;
      top.pre = bottom;
    }
  }
  
  /** 从链表中删除当前对象 */
  remove () {
    if (this.pre !== null) {
      this.pre.next = this.next;
    }
    if (this.next !== null) {
      this.next.pre = this.pre;
    }
  }
}
export default DelimitersStack;