/*
 * @Description: 通过```或者~~~触发的代码块识别
 * @Author: ZengYong
 * @CreateDate: 2021-10-21 11:21:57
 */
import Creater, { ICompleterProps, ICreaterProps, IDeleteProps } from "./creater";
import { CodeBlockNode } from "../node";
import { advanceOffset } from "../funs"
export class FencedCodeBlockCreater extends Creater {
  static reCodeBlock = /^`{3,}(?!.*`)|^~{3,}/;

  canComplete (task: ICompleterProps) {
		let lineRest = task.line;
		const match = lineRest.match(FencedCodeBlockCreater.reCodeBlock);
		let completerResult = null;
		if (match) {
      let completeInput = '\n' + match[0] + '\n';
      lineRest = lineRest.slice(match[0].length);
			completerResult = {
        completeInput,
        lineRest,
        cursor: 0
      }
		}
		return completerResult;
	}

  canDelete (task: IDeleteProps) {
    let deleteResult = null;
		// let lineRest = task.line;
		// const match = lineRest.match(FencedCodeBlockCreater.reCodeBlock);
		// let deleteLen = 0;
		// if (match) {
		// 	deleteResult = { lineRest: '', deleteLen}
    // }
    return deleteResult;
  }

  canCreate (task: ICreaterProps) {
    let createResult = null;
    let lineRest = task.line.slice(task.offset);
    if (this.maybeCodeBlock_(lineRest, task.nextLine)) {
      const match = lineRest.match(FencedCodeBlockCreater.reCodeBlock);
      if (match) {
        let result = advanceOffset(task.line, task.offset, task.column, match[0].length);
        const lang = task.line.slice(result.offset);
        result = advanceOffset(task.line, result.offset, result.column, lang.length);
        createResult = {
          offset: result.offset,
          column: result.column,
          spaceInTab: result.spaceInTab,
          mnode: new CodeBlockNode(task.sourceStart, lang, task.line + '\n')
        };
      }
    }
    return createResult;
  }

  maybeCodeBlock_ (currentLine: string, nextLine: string | undefined) {
    return nextLine === undefined ? false : true;
  }
}
export default FencedCodeBlockCreater;