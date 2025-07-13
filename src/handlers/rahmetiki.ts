import { Context, Scenes } from 'telegraf'
import { MyContext } from '../types/bot'

export default async function handleRahmetiki(ctx: MyContext) {
  await ctx.answerCbQuery()
  await ctx.scene.enter('rahmetiki-wizard')
}
