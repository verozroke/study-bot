import { MyContext } from '../types/bot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function setAdmin(ctx: MyContext) {
  const parts = (ctx.message as any)?.text?.split(' ')
  if (!parts || parts.length !== 3) {
    return ctx.reply('❗ Формат: /set-admin <секрет> <@username>')
  }

  const [, secret, rawUsername] = parts
  const username = rawUsername.replace('@', '')

  if (secret !== process.env.ADMIN_SECRET) {
    return ctx.reply('🚫 Неверное секретное слово.')
  }

  try {
    await prisma.admin.create({
      data: { username }
    })

    return ctx.reply(`✅ Пользователь @${username} добавлен как админ.`)
  } catch (e: any) {
    if (e.code === 'P2002') {
      return ctx.reply('⚠️ Этот пользователь уже админ.')
    }
    return ctx.reply('❗ Ошибка при добавлении админа.')
  }
}
