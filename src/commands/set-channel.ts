// src/commands/set-channel.ts
import { MyContext } from '../types/bot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


export async function setChannel(ctx: MyContext) {
  const parts = (ctx.message as any)?.text?.split(' ')
  if (!parts || parts.length !== 4) {
    return ctx.reply('❗ Формат: /setchannel <секрет> <https://t.me/groupchat> <порядковый_номер_топика>')
  }

  const [, secret, url, threadId] = parts

  if (secret !== process.env.CHANNEL_SECRET) {
    return ctx.reply('🚫 Неверное секретное слово.')
  }

  const match = url.match(/t\.me\/([a-zA-Z0-9_]+)/)
  if (!match) return ctx.reply('❗ Неверная ссылка на чат.')

  const username = match[1]

  try {
    // Получаем информацию о чате
    const chat = await ctx.telegram.getChat(`@${username}`)
    if (!chat || !chat.id) {
      return ctx.reply('❗ Не удалось получить ID группы.')
    }


    await prisma.channel.deleteMany()
    await prisma.channel.create({
      data: {
        username,
        groupId: BigInt(chat.id),
        messageThreadId: parseInt(threadId),
      }
    })

    return ctx.reply(`✅ Группа @${username} и топик "${threadId}" успешно установлены.`)
  } catch (err) {
    console.error(err)
    return ctx.reply('❗ Ошибка при установке группы и топика. Убедитесь, что бот является админом.')
  }
}
