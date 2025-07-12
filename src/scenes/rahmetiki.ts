import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const rahmetikScene = new Scenes.WizardScene<MyContext>(
  'rahmetiki-wizard',

  // Шаг 1: выбор стиля
  async (ctx) => {
    await ctx.reply('Выберите стиль рахметика:', Markup.inlineKeyboard([
      [Markup.button.callback('Порядочность', 'style_decency')],
      [Markup.button.callback('Счастье клиента', 'style_customer')],
      [Markup.button.callback('Лучшая команда ', 'style_team')],
      [Markup.button.callback('Усердная работа', 'style_work')],
      [Markup.button.callback('Кайдзен', 'style_kaizen')],
    ]))
    return ctx.wizard.next()
  },

  // Шаг 2: обработка выбора стиля
  async (ctx) => {
    const data = (ctx.update as any)?.callback_query?.data
    if (!data) {
      await ctx.reply('Пожалуйста, выберите стиль через кнопку.')
      return
    }

    (ctx.wizard.state as any).style = data.replace('style_', '')
    await ctx.answerCbQuery()
    await ctx.reply('Кому вы хотите отправить рахметик? (Имя)')
    return ctx.wizard.next()
  },

  // Шаг 3: ввод имени получателя
  async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      (ctx.wizard.state as any).recipient = ctx.message.text
      await ctx.reply('За что вы благодарны? (до 100 символов)')
      return ctx.wizard.next()
    }
    await ctx.reply('Пожалуйста, введите имя получателя.')
  },

  // Шаг 4: сообщение благодарности
  async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      (ctx.wizard.state as any).message = ctx.message.text.slice(0, 100)

      const { style, recipient, message } = ctx.wizard.state as any
      const styleToImage: Record<string, string> = {
        decency: 'decency.png',
        customer: 'customer.png',
        team: 'team.png',
        work: 'work.png',
        kaizen: 'kaizen.png'
      }

      const imageFileName = styleToImage[style ?? '']
      if (!imageFileName) {
        await ctx.reply('Ошибка: выбран неизвестный стиль.')
        return ctx.scene.leave()
      }

      const imagePath = path.resolve(__dirname, '..', 'assets', 'rahmetiki', imageFileName)
      const caption = `🌟 *Рахметик!*\n👤 *Кому:* ${recipient}\n🙏 *За что:* ${message}`

      const channel = await prisma.channel.findFirst()

      if (!channel || !channel.username) {
        await ctx.reply('❗ Ошибка: канал не задан. Используйте /set-channel чтобы установить его.')
        return ctx.scene.leave()
      }

      await ctx.telegram.sendPhoto(`@${channel.username}`, { source: fs.readFileSync(imagePath) }, {
        caption,
        parse_mode: 'Markdown'
      })

      await ctx.reply('✅ Ваш рахметик опубликован! Спасибо, что делитесь добротой 🙏')
      return ctx.scene.leave()
    }

    await ctx.reply('Пожалуйста, введите сообщение благодарности (до 100 символов).')
  }
)

export default rahmetikScene
