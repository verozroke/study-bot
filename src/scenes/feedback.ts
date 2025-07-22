import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const typeMap = {
  'suggestion': 'Предложение по улучшению',
  'idea': 'Идея',
  'problem': 'Проблема / Жалоба',
}


const beforeFeedbackPromiseMap = {
  'type_suggestion': `💡 Есть идея или предложение по улучшению процессов? 

📌 Пожалуйста, подумай над вопросами:
✔️ Что именно ты хочешь улучшить
✔️ Почему это важно
✔️ Как это повлияет на учеников, коллег или школу`,
  'type_problem': `✍️ Напиши свое обращение ниже. 🔒 Все сообщения обрабатываются конфиденциально.`
}

const feedbackScene = new Scenes.WizardScene<MyContext>(
  'feedback-wizard',

  // Шаг 1: выбрать тип обращения
  async (ctx) => {
    await ctx.reply('📌 Выберите тип обращения:', Markup.inlineKeyboard([
      [Markup.button.callback('📈 Предложение по улучшению', 'type_suggestion')],
      [Markup.button.callback('⚠️ Проблема / Жалоба', 'type_problem')],
      [Markup.button.callback('❌ Отмена', 'cancel')]
    ]))
    return ctx.wizard.next()
  },

  // Шаг 2: ввод текста
  async (ctx) => {
    if ('callback_query' in ctx.update && (ctx.update.callback_query as any).data) {
      (ctx.wizard.state as any).type = (ctx.update.callback_query as any).data.replace('type_', '')

      const type = (ctx.wizard.state as any).type;

      await ctx.answerCbQuery()

      await ctx.reply(beforeFeedbackPromiseMap[type as keyof typeof beforeFeedbackPromiseMap])


      await ctx.reply('✏️ Напишите ваше сообщение (до 500 символов):', Markup.keyboard([
        ['❌ Отмена']
      ]).oneTime().resize())
      return ctx.wizard.next()
    }
  },

  // Шаг 3: указать имя или нет
  async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      (ctx.wizard.state as any).text = ctx.message.text.slice(0, 500)
      await ctx.reply('👤 Хотите указать своё имя?', Markup.inlineKeyboard([
        [Markup.button.callback('Да', 'show_name')],
        [Markup.button.callback('Нет', 'anonymous')],
        [Markup.button.callback('❌ Отмена', 'cancel')]

      ]))
      return ctx.wizard.next()
    }
  },

  // Шаг 4: обработка выбора да/нет
  async (ctx) => {
    if ('callback_query' in ctx.update) {
      const action = (ctx.update.callback_query as any).data
      await ctx.answerCbQuery()

      if (action === 'show_name') {
        await ctx.reply('Введите ваше имя, школу и должность:', Markup.keyboard([
          ['❌ Отмена']
        ]).oneTime().resize())
        return ctx.wizard.next()
      } else {
        (ctx.wizard.state as any).sender = 'Аноним'
        return sendFeedback(ctx)
      }
    }
  },

  // Шаг 5: имя вручную
  async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      (ctx.wizard.state as any).sender = ctx.message.text
      return sendFeedback(ctx)
    }
  }
)

async function sendFeedback(ctx: MyContext) {
  const { type, text, sender } = ctx.wizard.state as any

  const admin = await prisma.admin.findFirst()
  console.log(admin)
  if (!admin) {
    await ctx.reply('❗ Ошибка: не найден администратор.')
    return ctx.scene.leave()
  }


  const msg = `📥 *Новое обращение*

📌 Тип: ${typeMap[type as keyof typeof typeMap]}\n
              
💬 Текст: ${text}\n
              
👤 От: ${sender ?? 'Аноним'}`
  await ctx.telegram.sendMessage(admin.telegramId, msg, { parse_mode: 'Markdown' })

  await ctx.reply('✅ Ваше обращение отправлено HR-команде. ✅ Спасибо за вашу вовлечённость!')
  return ctx.scene.leave()
}


feedbackScene.hears('❌ Отмена', async (ctx) => {
  await ctx.reply('❌ Действие отменено.', Markup.removeKeyboard())
  return ctx.scene.leave()
})

feedbackScene.action('cancel', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply('❌ Действие отменено.')
  return ctx.scene.leave()
})


export default feedbackScene
