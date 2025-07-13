import { MyContext } from '../types/bot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


export async function setAdmin(ctx: MyContext) {
  const parts = (ctx.message as any)?.text?.split(' ')
  if (!parts || parts.length !== 2) {
    return ctx.reply('❗ Формат: /setadmin <секрет>')
  }

  const [, secret] = parts

  if (secret !== process.env.ADMIN_SECRET) {
    return ctx.reply('🚫 Неверное секретное слово.')
  }

  const user = ctx.from
  if (!user || !user.id) {
    return ctx.reply('❗ Не удалось получить информацию о пользователе.')
  }

  try {
    await prisma.admin.deleteMany()
    await prisma.admin.create({
      data: {
        username: user.username ?? 'unknown',
        telegramId: user.id.toString(),
      }
    })

    return ctx.reply(`✅ Вы успешно назначены админом.`)
  } catch (e: any) {
    if (e.code === 'P2002') {
      return ctx.reply('⚠️ Этот пользователь уже админ.')
    }

    console.error('Ошибка в setAdmin:', e)
    return ctx.reply('❗ Ошибка при добавлении админа.')
  }
}