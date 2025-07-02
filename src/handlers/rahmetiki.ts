import { Context, Scenes } from 'telegraf'
import { MyContext } from '../types/bot'

export default async function handleRahmetiki(ctx: MyContext) {
  await ctx.answerCbQuery() // remove loading animation
  await ctx.scene.enter('rahmetiki-wizard')
}
