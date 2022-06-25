/*
 * @Description: 责任链处理器父类。根据行字符串处理生成其对应的AST节点,并添加到doc中。扩展为输入删除补充器+block创建器
 * @Author: ZengYong
 * @CreateDate: 2021-10-20 18:17:39
 */
import { SubNode } from "../node";

export interface ICompleterProps {
  line: string
}

export interface ICompleterResult {
  completeInput: string,
  lineRest: string,
  cursor?: number
}

export interface IDeleteProps {
  line: string
}

export interface IDeleteResult {
  deleteLen: number,
  lineRest: string,
  cursor?: number
}

export interface ICreaterProps {
  line: string,
  nextLine: string | undefined,
  offset: number,
  column: number,
  container: SubNode,
  // indent: number,
  sourceStart: number
}

export interface ICreaterResult {
  offset: number,
  column: number,
  spaceInTab: number,
  mnode: SubNode
}



export class Creater {
  protected next: Creater;

  setNext (next: Creater) {
    this.next = next;
  }

  complete (task: ICompleterProps): ICompleterResult | null {
    let completeResult = this.canComplete(task);
    if (!completeResult && this.next) {
      completeResult = this.next.complete(task);
    }
    return completeResult;
  }

  canComplete (task: ICompleterProps): ICompleterResult | null {
    return null;
  }

  delete (task: IDeleteProps): IDeleteResult | null {
    let deleteResult = this.canDelete(task);
    if (!deleteResult && this.next) {
      deleteResult = this.next.delete(task);
    }
    return deleteResult;
  }

  canDelete (task: IDeleteProps): IDeleteResult | null {
    return null;
  }

  create (task: ICreaterProps): ICreaterResult | null {
    let createResult = this.canCreate(task);
    if (!createResult && this.next) {
      createResult = this.next.create(task);
    }
    return createResult;
  }

  canCreate (task: ICreaterProps): ICreaterResult | null {
    return null;
  }

}
export default Creater;