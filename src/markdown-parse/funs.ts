
function replaceUnsafeChar (str: string) {
  switch (str) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    case '"':
      return "&quot;";
    default:
      return str;
  }
};


/** 当前位置前移，1个tab对应4个空格 */
export function advanceOffset (line: string, offset: number, column: number, count: number, forColumns?: boolean) {
  let char, spaceInTab = 0;
  while (count > 0 && (char = line[offset])) {
    if (char === "\t") {
      spaceInTab = 4 - (column % 4); // 一个tab内还剩余多少个空格
      if (forColumns) {
        const inTab = spaceInTab > count; // 剩余空格足够满足本次移动
        const columnDelta = inTab ? count : spaceInTab; // 最多移动一个tab
        offset += inTab ? 0 : 1; // 剩余空格足够满足本次移动,则offset不用移动，说明在一个tab字符内
        column += columnDelta;
        count -= columnDelta;
      } else {
        column += spaceInTab;
        spaceInTab = 0;
        offset += 1;
        count -= 1;
      }
    } else {
      offset += 1;
      column += 1;
      count -= 1;
    }
  }
  return { offset, column, spaceInTab }
}

export function isSpacerOrTab (char: string) {
  return char === ' '|| char === '\t';
}

export function getPreSpacerOrTab (str: string) {
  const match = str.match(/^\s+/);
  return match ? match[0] : '';
}

export function escapeXml (str: string) {
  const reXmlSpecial = new RegExp('[&<>"]', "g");
  if (reXmlSpecial.test(str)) {
      return str.replace(reXmlSpecial, replaceUnsafeChar);
  } else {
      return str;
  }
}