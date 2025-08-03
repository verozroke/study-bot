// src/scenes/rahmetiki.ts
import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { escapeMarkdownV2 } from '../utils/escape'
const u = (s: string) => escapeMarkdownV2(s);

const prisma = new PrismaClient()

const schools = [
  'Aldi BI',
  'BINOM - им. К.Сатпаева',
  'BINOM - им. А. Бөкейхана',
  'BINOM - им. Қадыр Мырза Әлі',
  'BINOM - им. А. Байтұрсынұлы',
  'BINOM - им. Ы. Алтынсарина',
  'BINOM - им. Ә. Кекілбаева',
  'BINOM - им. Д. Қонаева',
  'BINOM - им. Әл-Фараби',
  'Quantum TECH',
  'Quantum STEM',
  'Riviera International School',
  'BI Education',
  'УК BINOM',
  'FARABI Шымкент',
  'УК FARABI',
  'QMC',
]

const rahmetikScene = new Scenes.WizardScene<MyContext>(
  'rahmetiki-wizard',

  // Шаг 1: Получение имени и опционального username
  async (ctx) => {
    await ctx.reply(
      `Хотите отправить благодарность? Отлично! 😊 Посмотри примеры алғысов в чате "Алғыс сөздері"! 

✍️Напишите кому вы хотите выразить алғыс — напишите Имя и Фамилию. Если знаете Telegram username (начинается с @), тоже добавьте — это поможет отметить получателя  и отправить ему уведомление.

📌Пример: Айгуль Ахметова, @aigul_akhmetova`,
      Markup.keyboard([['❌ Отмена']]).oneTime().resize()
    )
    return ctx.wizard.next()
  },

  // Шаг 2: Получение школы
  async (ctx) => {
    if ('text' in ((ctx.message as any) || {})) {
      (ctx.wizard.state as any).recipient = (ctx.message as any).text
      await ctx.reply('🏫 В какой школе работает получатель алғыса?', Markup.keyboard(
        schools.map(name => [name])
      ).oneTime().resize())
      return ctx.wizard.next()
    }
    await ctx.reply('❗ Введите имя и фамилию получателя.')
  },

  // Шаг 3: Школа → Что сделал(а)
  async (ctx) => {
    if ('text' in ((ctx.message as any) || {})) {
      (ctx.wizard.state as any).school = (ctx.message as any).text
      await ctx.reply(
        `Давай вместе подумаем, как сделать твой алғыс более тёплым и конкретным 💌

✍️Что сделал(а) твой коллега?
Подумай, какой поступок ты хочешь отметить и чем он помог команде, тебе или школе.

📌 Например: помог провести презентацию, стала наставником для новичков, реализовал идею... это помогло завершить проект в срок, удержать новых сотрудников и тд.`
      )

      Markup.removeKeyboard()
      return ctx.wizard.next()
    }
    await ctx.reply('❗ Пожалуйста, выбери школу из списка.')
  },

  // Шаг 4: Качества
  async (ctx) => {
    if ('text' in ((ctx.message as any) || {})) {
      (ctx.wizard.state as any).what = (ctx.message as any).text
      await ctx.reply(
        `✍️ Напиши,какие качества продемонстрировал твой коллега? Подумай, какой суперсилой он обладает?

📌Например: его инициативность вдохновила команду, его креативность привела к созданию уникальной программы...`
      )
      return ctx.wizard.next()
    }
    await ctx.reply('❗ Введите текст.')
  },

  // Шаг 5: Выбор стиля
  async (ctx) => {
    if ('text' in ((ctx.message as any) || {})) {
      (ctx.wizard.state as any).qualities = (ctx.message as any).text
      await ctx.reply(
        'Давай подберём открытку! 🎁\nВыбери ниже ценность, которая лучше всего отражает твоего коллегу и то, за что ты хочешь его поблагодарить — мы подберём открытку, которая это передаёт 🌟',
        Markup.inlineKeyboard([
          [Markup.button.callback('Порядочность', 'style_decency')],
          [Markup.button.callback('Эмпатия', 'style_customer')],
          [Markup.button.callback('Постоянное развитие', 'style_team')],
          [Markup.button.callback('Усердная работа', 'style_work')],
          [Markup.button.callback('Мы - лучшая команда', 'style_kaizen')],
          [Markup.button.callback('❌ Отмена', 'cancel')]
        ])
      )
      return ctx.wizard.next()
    }
    await ctx.reply('❗ Введите текст.')
  },

  // Шаг 6: От кого отправить
  async (ctx) => {
    const data = (ctx.update as any)?.callback_query?.data
    if (!data) return ctx.reply('❗ Выберите стиль.');

    (ctx.wizard.state as any).style = data.replace('style_', '')
    await ctx.answerCbQuery()
    await ctx.reply('✨ Последний штрих — от кого отправим открытку? (например: С уважением, Айдана)')
    return ctx.wizard.next()
  },

  // Шаг 7: Сбор и отправка
  async (ctx) => {
    if (!('text' in ((ctx.message as any) || {}))) return ctx.reply('❗ Введите имя отправителя.');
    (ctx.wizard.state as any).sender = (ctx.message as any).text

    const { recipient, school, what, qualities, style, sender } = ctx.wizard.state as any

    const styleToImage: Record<string, string> = {
      decency: 'decency.png',
      customer: 'customer.png',
      team: 'team.png',
      work: 'work.png',
      kaizen: 'kaizen.png'
    }

    const image = styleToImage[style]
    if (!image) {
      await ctx.reply('❗ Ошибка: неизвестный стиль открытки.')
      return ctx.scene.leave()
    }

    const channel = await prisma.channel.findFirst()
    if (!channel || !channel.groupId || !channel.messageThreadId) {
      await ctx.reply('❗ Группа или тред не настроены. Используйте /setchannel.')
      return ctx.scene.leave()
    }

    const imagePath = path.resolve(__dirname, '..', 'assets', 'rahmetiki', image)

    const caption = `
🌟 *Алғыс білдіремін!*
👤 *Кому:* ${u(recipient)} 
🏫 *Школа:* ${u(school)}

${u(what)}!
${u(qualities)}!

*✍️ ${u(sender)}*
    `

    await ctx.telegram.sendPhoto(channel.groupId.toString(), { source: fs.readFileSync(imagePath) }, {
      caption,
      parse_mode: 'Markdown',
    })

    await ctx.reply('💌 Ваш Алғыс принят и опубликован в группе. Тёплые слова — это сила.')
    return ctx.scene.leave()
  }
)

rahmetikScene.hears('❌ Отмена', async (ctx) => {
  await ctx.reply('❌ Действие отменено.', Markup.removeKeyboard())
  return ctx.scene.leave()
})

rahmetikScene.action('cancel', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply('❌ Действие отменено.')
  return ctx.scene.leave()
})

export default rahmetikScene
