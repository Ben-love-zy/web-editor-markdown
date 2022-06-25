/*
 * @Description: MTreeWalker，以语法树中任何 Mnode 节点作为起点进行先序深度遍历。与原生的 TreeWalker 类似。
 * @Author: ZengYong
 * @CreateDate: 2021-10-19 19:29:49
 */

import { SubNode } from "./node";

export class MTreeWalker {
  private root_: SubNode;
  private current_: SubNode | null;
  private close_: boolean;

  constructor (mnode: SubNode) {
    this.root_ = mnode;
    this.current_ = mnode;
    this.close_ = false;
  }

  /** 获取下一个节点 */
  next () {
    let mnode = this.current_;
    let close = this.close_;

    if (mnode === null) {
        return null;
    }

    if (!close && mnode.isContainer) {
        if (mnode.firstChild) {
            this.current_ = mnode.firstChild as SubNode;
            this.close_ = false;
        } else {
            this.close_ = true;
        }
    } else if (mnode === this.root_) {
        this.current_ = null;
    } else if (mnode.next === null) {
        this.current_ = mnode.parent as SubNode;
        this.close_ = true;
    } else {
        this.current_ = mnode.next as SubNode;
        this.close_ = false;
    }

    return { mnode, close };
  }
}
export default MTreeWalker;