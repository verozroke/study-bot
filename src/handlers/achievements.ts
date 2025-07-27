import { MyContext } from '../types/bot'

export default async function handleAchievements(ctx: MyContext) {
  await ctx.answerCbQuery()
  return ctx.scene.enter('achievement-wizard')
}
