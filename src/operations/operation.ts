/*
 * @Description: OP 父类
 * @Author: ZengYong
 * @CreateDate: 2021-09-17 19:15:50
 */
import Editor from "../editor";

export class Operation {

  constructor () {}

  /** OP 应用。OP 子类自己实现差异化 */
  apply (editor: Editor) {}

  /** 反转自己，撤销回退使用 */
  inverse () {}

}
export default Operation;