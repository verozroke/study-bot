import { Context } from 'telegraf'

export default async function handleAchievements(ctx: Context) {
  await ctx.answerCbQuery()
  await ctx.reply('Вы выбрали: Достижения 🎯 (будет реализовано позже)')
}