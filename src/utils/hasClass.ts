export function hasClass(dom: Element, className: string) {
  const classList = dom.getAttribute("class")?.split(" ");
  return classList ? classList.includes(className) : false;
}
