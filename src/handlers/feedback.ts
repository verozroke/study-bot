import { Context } from 'telegraf'

export default async function handleFeedback(ctx: Context) {
  await ctx.answerCbQuery()
  await ctx.reply('Вы выбрали: Обратная связь 💬 (будет реализовано позже)')
}