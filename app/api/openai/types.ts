import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-17 11:47:44
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-17 11:55:25
 * @FilePath: /private-component-codegen/app/api/openai/types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

// openaiRequest
export type openAIRequest = {
  message: ChatCompletionMessageParam[];
}
