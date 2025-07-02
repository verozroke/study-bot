import { Context } from 'telegraf'

export default async function handleMediator(ctx: Context) {
  await ctx.answerCbQuery()
  await ctx.reply('Вы выбрали: Медиатор 🤖 (будет реализовано позже)')
}