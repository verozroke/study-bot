import { MyContext } from '../types/bot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function setChannel(ctx: MyContext) {
  const parts = (ctx.message as any)?.text?.split(' ')
  if (!parts || parts.length !== 3) {
    return ctx.reply('❗ Формат: /set-channel <секрет> <https://t.me/channel>')
  }

  const [, secret, url] = parts

  if (secret !== process.env.CHANNEL_SECRET) {
    return ctx.reply('🚫 Неверное секретное слово.')
  }

  const match = url.match(/t\.me\/([a-zA-Z0-9_]+)/)
  if (!match) return ctx.reply('❗ Неверная ссылка на канал.')

  const username = match[1]

  try {
    const msg = await ctx.telegram.sendMessage(`@${username}`, '🛠️ Канал установлен как целевой.')

    // Удалим старый, сохраним новый
    await prisma.channel.deleteMany()
    await prisma.channel.create({
      data: {
        username,
      }
    })

    return ctx.reply(`✅ Канал @${username} успешно установлен.`)
  } catch (err) {
    console.error(err)
    return ctx.reply('❗ Бот не может написать в канал. Убедитесь, что он добавлен как админ.')
  }
}
