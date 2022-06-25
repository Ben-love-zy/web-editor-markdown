export function debounce(fn: Function, delay: number = 0) {
  let timer: number | null;
  // let args = arguments;
  return (...args: any) => {
    if (timer) {
      window.clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      fn(...args);
      // fn.apply(this, args);
    }, delay)
  }
}