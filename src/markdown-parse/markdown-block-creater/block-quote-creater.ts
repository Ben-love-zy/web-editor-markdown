/*
 * @Description: 引用识别
 * @Author: ZengYong
 * @CreateDate: 2021-10-21 11:21:57
 */
import Creater, { ICompleterProps, IDeleteProps, ICreaterProps } from "./creater";
import { BlockQuoteNode } from "../node";
import { advanceOffset, isSpacerOrTab } from "../funs"
export class BlockQuoteCreater extends Creater {
  static reBlockQuoteMarker = /^>\s*/;

  canDelete (task: IDeleteProps) {
    let deleteResult = null;
		let lineRest = task.line;
		const match = lineRest.match(BlockQuoteCreater.reBlockQuoteMarker);
		let deleteLen = 0;
		if (match) {
			lineRest = lineRest.slice(match[0].length);
			deleteLen = match[0].length;
			// if (lineRest.length) {
			// 	const spacerMatch = lineRest.match(/^\s+/);
			// 	if (spacerMatch) {
			// 		lineRest = lineRest.slice(spacerMatch[0].length);
			// 		deleteLen += spacerMatch[0].length;
			// 	}
			// }
		}
		if (deleteLen > 0) {
			deleteResult = { lineRest, deleteLen }
		}
    return deleteResult;
  }


  canComplete (task: ICompleterProps) {
    let lineRest = task.line;
    let completerResult = null;

    const blockQuoteMatch = lineRest.match(BlockQuoteCreater.reBlockQuoteMarker);
    if (blockQuoteMatch) {
      lineRest = lineRest.slice(blockQuoteMatch[0].length);
      if (lineRest.length) {
        completerResult = {
					completeInput: blockQuoteMatch[0],
					lineRest
				}
      }
    }
    return completerResult;
  }

  canCreate (task: ICreaterProps) {
    let createResult = null;
    let char = task.line[task.offset];
    if (char === '>') {
      let offsetNew = task.offset;
      let columnNew = task.column;
      let spaceInTabNew = 0;
      const { offset, column, spaceInTab } = advanceOffset(task.line, offsetNew, columnNew, 1);
      char = task.line[offset];
      offsetNew = offset;
      columnNew = column;
      spaceInTabNew = spaceInTab;
      if (isSpacerOrTab(char)) {
        const result = advanceOffset(task.line, offset, column, 1, true);
        offsetNew = result.offset;
        columnNew = result.column;
        spaceInTabNew = result.spaceInTab;
      }
      createResult = {
        offset: offsetNew,
        column: columnNew,
        spaceInTab: spaceInTabNew,
        mnode: new BlockQuoteNode(task.sourceStart)
      }
    }
    return createResult
  }
}
export default BlockQuoteCreater;