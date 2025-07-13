import { MyContext } from '../types/bot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handleAchievements(ctx: MyContext) {
  await ctx.answerCbQuery()
  const userId = ctx.from?.id.toString()
  if (!userId) return ctx.reply('❗ Ошибка: не удалось получить ID пользователя.')

  const existing = await prisma.achievement.findFirst({ where: { userId } })

  if (existing) {
    return ctx.scene.enter('achievement-wizard', {
      fullName: existing.fullName,
      school: existing.school,
      position: existing.position,
      text: existing.text,
      photoId: existing.photoId
    } as any)
  }

  return ctx.scene.enter('achievement-wizard')
}