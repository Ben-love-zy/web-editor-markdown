/*
 * @Description: 列表和列表项识别
 * @Author: ZengYong
 * @CreateDate: 2021-10-21 11:21:57
 */

import Creater, { ICompleterProps, IDeleteProps, ICreaterProps } from "./creater";
import { NodeType, ListNode, ItemNode, SubNode } from "../node";
import { advanceOffset, isSpacerOrTab } from "../funs"
export class ListItemCreater extends Creater {
	// static reBulletListMarker = /^[*+-]/;
	// static reOrderedListMarker = /^(\d{1,9})([.)])/;

	static reBulletListMarker = /^([*+-]\s)/;
	static reOrderedListMarker = /^(\d{1,9})([.)])\s/;
	
	canDelete (task: IDeleteProps) {
		let deleteResult = null;
		let lineRest = task.line;
		let deleteLen = 0;
		let listType = 'bullet';
		let match = lineRest.match(ListItemCreater.reBulletListMarker);
		if (!match) {
			match = lineRest.match(ListItemCreater.reOrderedListMarker);
			listType = 'ordered';
		}
		if (match) {
			lineRest = lineRest.slice(match[0].length);
			deleteLen = match[0].length;
			if (listType === 'bullet') {
				const checkboxMatch = lineRest.match(/^\s*\[(?:[x X])\]\s/);
				if (checkboxMatch) {
					lineRest = lineRest.slice(checkboxMatch[0].length);
					deleteLen += checkboxMatch[0].length;
				}
			}
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

	canComplete111 (task: ICompleterProps) {
		let lineRest = task.line;
		const bulletMatch = lineRest.match(ListItemCreater.reBulletListMarker); // 无序列表
		let completerResult = null;
		let match;
		let lastMatch = '';
		let lastSpacerMatch = '';
		let preSpacerCount = 0; // 需在前面补充多少个空格
		while ((match = lineRest.match(ListItemCreater.reBulletListMarker)) || (match = lineRest.match(ListItemCreater.reOrderedListMarker))) {
			lineRest = lineRest.slice(match[0].length);
			if (lineRest.length) {
				const spacerMatch = lineRest.match(/^\s+/);
				if (spacerMatch) {
					lineRest = lineRest.slice(spacerMatch[0].length);
					if (lineRest.length) { // 非空行才更新，因为空行需要退位
						lastSpacerMatch = spacerMatch[0];
						preSpacerCount += lastSpacerMatch.length;
					}
				}
				if (lineRest.length) { // 非空行才更新，因为空行需要退位
					lastMatch = match[0];
					preSpacerCount += lastMatch.length;
				}
			}
		}
		return completerResult;
	}

	canComplete (task: ICompleterProps) {
		let lineRest = task.line;
		const bulletMatch = lineRest.match(ListItemCreater.reBulletListMarker); // 无序列表
		let completerResult = null;
		// let needDeletePreLine = false; // 是否需要删除上一行
		// 非空列表行
		if (bulletMatch) {
			lineRest = lineRest.slice(bulletMatch[0].length);
			if (lineRest) {
				let completeInput = bulletMatch[0];
				const checkboxMatch = lineRest.match(/^\[(?:[x X])\]\s/);
				if (checkboxMatch) {
					lineRest = lineRest.slice(checkboxMatch[0].length);
					if (lineRest) {
						completeInput += checkboxMatch[0];
					}
				}
				if (lineRest) {
					completerResult = {
						completeInput,
						lineRest
					}
				}
			}
		} else {
			const orderedMatch = lineRest.match(ListItemCreater.reOrderedListMarker); // 有序列表
			if (orderedMatch) {
				lineRest = lineRest.slice(orderedMatch[0].length)
				if (lineRest) {
					const orderedMatchArr = orderedMatch[0].split('.');
					const orderedNum = parseInt(orderedMatchArr[0]);
					completerResult = {
						completeInput: (orderedNum + 1) + '.' + orderedMatchArr[1],
						lineRest
					}
				}
			}
		}
		// completerResult.needDeletePreLine = needDeletePreLine;
		return completerResult;
	}


	
	canCreate (task: ICreaterProps) {
		let createResult = null;
		let mnnode: SubNode;
		let listNode = null;
		const matchResult = this.matchList_(task.line, task.offset);
		if (matchResult) {
			if (task.container.type !== NodeType.List || !this.isSameList_(task.container as ListNode | ItemNode, matchResult)) {
				listNode = new ListNode(task.sourceStart, matchResult.listType, matchResult.bulletChar, matchResult.delimiter, task.column, matchResult.start);
			}
			const itemNode = new ItemNode(task.sourceStart, matchResult.listType, matchResult.bulletChar, matchResult.delimiter, task.column);
			if (listNode) {
				listNode.appendChild(itemNode);
				mnnode = listNode;
			} else {
				mnnode = itemNode;
			}
			const result = advanceOffset(task.line, task.offset, task.column, matchResult.offset);
			createResult = {
				offset: result.offset,
				column: result.column,
				spaceInTab: result.spaceInTab,
				mnode: mnnode
			}
		}
		return createResult;
	}

	isSameList_ (container: ListNode | ItemNode, matchResult: any) {
		return (
			container.listType === matchResult.listType &&
			container.delimiter === matchResult.delimiter &&
			container.bulletChar === matchResult.bulletChar
		);
	}

	matchList_ (line: string, offset: number) {
		let listType = '';
		let bulletChar = '';
		let delimiter = '';
		let start = '1';
		const rest = line.slice(offset);
		let match = rest.match(ListItemCreater.reBulletListMarker);
		if (match) {
			listType = 'bullet';
			bulletChar = match[0][0];
		} else {
			match = rest.match(ListItemCreater.reOrderedListMarker);
			if (match) {
				start = match[1];
				listType = 'ordered';
				delimiter = match[2];
			} else {
				return null;
			}
		}
		// const nextChar = line[offset + match[0].length];
		// // 符号后面必须有空格或者tab才触发列表
		// if (!isSpacerOrTab(nextChar)) {
		// 	return null;
		// }
		return { listType, bulletChar, delimiter, offset: match[0].length, start};
	}

  
}
export default ListItemCreater;