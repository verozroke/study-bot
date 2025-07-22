// src/scenes/rahmetiki.ts
import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const schools = [
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
  'Riviera',
  'Farabi Шымкент',
  'Farabi Атырау',
  'BI Education'
]

const rahmetikScene = new Scenes.WizardScene<MyContext>(
  'rahmetiki-wizard',

  // Шаг 1: Выбор способа указания имени
  async (ctx) => {
    await ctx.reply(
      'Хочешь отправить благодарность — супер! 😊 Посмотри примеры алғысов в чате "Алғыс сөздері"!\n\nУкажи имя и фамилию или поделись контактом:',
      Markup.inlineKeyboard([
        [Markup.button.callback('📝 Указать Имя и Фамилию', 'manual_name')],
        [Markup.button.callback('📱 Поделиться юзернеймом', 'share_contact')],
        [Markup.button.callback('❌ Отмена', 'cancel')]
      ])
    )
    return ctx.wizard.next()
  },

  // Шаг 2: Получение имени или юзернейма
  async (ctx) => {
    const data = (ctx.update as any)?.callback_query?.data
    if (data === 'manual_name') {
      (ctx.wizard.state as any).mode = 'manual'
      await ctx.answerCbQuery()
      await ctx.reply('✍️ Введи имя и фамилию получателя:')
      return ctx.wizard.selectStep(2)
    } else if (data === 'share_contact') {
      (ctx.wizard.state as any).mode = 'contact'
      await ctx.answerCbQuery()
      await ctx.reply('📱 Укажи @юзернейм получателя:')
      return ctx.wizard.selectStep(3)
    }
    await ctx.reply('❗ Выберите один из вариантов.')
  },

  // Шаг 2.1: Получаем имя
  async (ctx) => {
    if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).recipient = (ctx.message as any).text
      await ctx.reply('🏫 В какой школе работает получатель алғыса?', Markup.keyboard(schools.map(name => [name])).oneTime().resize())
      return ctx.wizard.selectStep(4)
    }
    await ctx.reply('❗ Введите текстом имя и фамилию.')
  },

  // Шаг 2.2: Получаем юзернейм
  async (ctx) => {
    if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).recipient = (ctx.message as any).text
      await ctx.reply('🏫 В какой школе работает получатель алғыса?', Markup.keyboard(schools.map(name => [name])).oneTime().resize())
      return ctx.wizard.next()
    }
    await ctx.reply('❗ Укажи корректный @юзернейм.')
  },

  // Шаг 3: Получение школы
  async (ctx) => {
    if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).school = (ctx.message as any).text
      await ctx.reply(`Давай вместе подумаем, как сделать твой алғыс более тёплым и конкретным 💌 - чтобы он отражал поступок коллеги, проявленные качества и результат его действий!

✍️Напиши что сделал(а) твой коллега?

📌 Например: помог провести презентацию, поддержал коллегу, реализовал идею, показал усердность, поделился знаниями и тд.`)
      return ctx.wizard.next()
    }
    await ctx.reply('❗ Пожалуйста, выбери школу из списка.')
  },

  // Шаг 3.1: Что сделал
  async (ctx) => {
    if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).what = (ctx.message as any).text
      await ctx.reply(`✍️ Напиши одно-два качества, которые проявил(а) коллега?

📌Например: честность, открытость, внимание к другим, настойчивость, командный дух, ответственность и тд.`)
      return ctx.wizard.next()
    }
    await ctx.reply('❗ Пожалуйста, введи текст.')
  },

  // Шаг 3.2: Качества
  async (ctx) => {
    if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).qualities = (ctx.message as any).text
      await ctx.reply(`✍️ Напиши, чем это помогло тебе, команде или школе? 

📌Например: завершили успешно проект, сплотилась команда, ученики и родители получили лучший опыт, появилась ясность в проектах, улучшился проект, узнали больше о... и тд.`)
      return ctx.wizard.next()
    }
    await ctx.reply('❗ Пожалуйста, введи текст.')
  },

  // Шаг 3.3: Результат
  async (ctx) => {
    if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).impact = (ctx.message as any).text
      await ctx.reply(`Давай подберём открытку! 🎁
Выбери ниже ценность, которая лучше всего отражает твоего коллегу и то, за что ты хочешь его поблагодарить — мы подберём открытку, которая это передаёт 🌟`, Markup.inlineKeyboard([
        [Markup.button.callback('Порядочность', 'style_decency')],
        [Markup.button.callback('Эмпатия', 'style_customer')],
        [Markup.button.callback('Постоянное развитие', 'style_team')],
        [Markup.button.callback('Усердная работа', 'style_work')],
        [Markup.button.callback('Мы - лучшая команда', 'style_kaizen')],
        [Markup.button.callback('❌ Отмена', 'cancel')]
      ]))
      return ctx.wizard.next()
    }
    await ctx.reply('❗ Введи текст результата.')
  },

  // Шаг 4: выбор стиля
  async (ctx) => {
    const data = (ctx.update as any)?.callback_query?.data
    if (!data) {
      await ctx.reply('❗ Выбери стиль через кнопку.')
      return
    }

    (ctx.wizard.state as any).style = data.replace('style_', '')
    await ctx.answerCbQuery()
    await ctx.reply('✨ Последний штрих — от кого отправим открытку? (например: С уважением, Айдана)')
    return ctx.wizard.next()
  },

  // Шаг 5: От кого отправить открытку
  async (ctx) => {
    if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).sender = (ctx.message as any).text

      const {
        recipient, school, what, qualities, impact,
        style, sender
      } = ctx.wizard.state as any

      const styleToImage: Record<string, string> = {
        decency: 'decency.png',
        customer: 'customer.png',
        team: 'team.png',
        work: 'work.png',
        kaizen: 'kaizen.png'
      }

      const imageFileName = styleToImage[style]
      if (!imageFileName) {
        await ctx.reply('❗ Ошибка: неизвестный стиль.')
        return ctx.scene.leave()
      }

      const imagePath = path.resolve(__dirname, '..', 'assets', 'rahmetiki', imageFileName)
      const caption = `
      🌟 *Алғыс білдіремін!*
👤 *Кому:* ${recipient} 
🏫 *Школа:* ${school}

${what}!
При работе преподаватель проявил ${qualities}!
${impact}!

*✍️ ${sender}*
      `


      const channel = await prisma.channel.findFirst()
      if (!channel || !channel.groupId || !channel.messageThreadId) {
        await ctx.reply('❗ Канал или тред не настроен. Используйте /setchannel.')
        return ctx.scene.leave()
      }

      await ctx.telegram.sendPhoto(channel.groupId.toString(), {
        source: fs.readFileSync(imagePath)
      }, {
        caption,
        parse_mode: 'Markdown',
        // message_thread_id: channel.messageThreadId
      })

      await ctx.reply('✅ Рахметик опубликован! Спасибо за тёплые слова 🙏')
      return ctx.scene.leave()
    }

    await ctx.reply('❗ Введи имя отправителя.')
  }
)

// Общий обработчик отмены
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
