/*
 * @Author: huangyuning huangyuning@vv.cn
 * @Date: 2025-04-14 19:38:27
 * @LastEditors: huangyuning huangyuning@vv.cn
 * @LastEditTime: 2025-04-15 22:32:24
 * @FilePath: /private-component-codegen/lib/db/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env.mjs";

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client);

