import { Context, Scenes } from 'telegraf'
import { MyContext } from '../types/bot'

export default async function handleNomination(ctx: MyContext) {
  await ctx.answerCbQuery()
  await ctx.scene.enter('nomination-wizard')
}
