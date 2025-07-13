import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function showPreview(ctx: MyContext) {
  const state = ctx.wizard.state as any

  const text =
    `📋 *Предпросмотр*\n` +
    `👤 ${state.fullName} (${state.position}, ${state.school})\n\n` +
    `📌 ${state.text}`

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Отправить', 'confirm')],
    [Markup.button.callback('🔁 Изменить', 'edit')],
  ])

  if (state.photoId) {
    return ctx.replyWithPhoto(state.photoId, {
      caption: text,
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup,
    })
  }

  return ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard.reply_markup,
  })
}

const achievementScene = new Scenes.WizardScene<MyContext>(
  'achievement-wizard',

  // Шаг 1.1 – ФИО, школа, должность
  async (ctx) => {
    const userId = ctx.from?.id.toString()
    const existing = await prisma.achievement.findFirst({
      where: { userId },
    })

    if (existing) {
      const state = ctx.wizard.state as any
      state.fullName = existing.fullName
      state.school = existing.school
      state.position = existing.position
      state.text = existing.text
      state.photoId = existing.photoId

      return showPreview(ctx)
    }

    await ctx.reply('📌 Укажите ваше ФИО')
    return ctx.wizard.next()
  },

  async (ctx) => {
    ; (ctx.wizard.state as any).fullName = (ctx.message as any).text
    await ctx.reply('🏫 Укажите вашу школу')
    return ctx.wizard.next()
  },

  async (ctx) => {
    ; (ctx.wizard.state as any).school = (ctx.message as any).text
    await ctx.reply('👨‍🏫 Укажите вашу должность')
    return ctx.wizard.next()
  },

  async (ctx) => {
    ; (ctx.wizard.state as any).position = (ctx.message as any).text
    await ctx.reply('✏️ Опишите достижение (до 300 символов)')
    return ctx.wizard.next()
  },

  async (ctx) => {
    const message = ctx.message as any
    const state = ctx.wizard.state as any

    state.text = message?.text ?? ''
    await ctx.reply('📷 Хотите добавить фото?', Markup.inlineKeyboard([
      [Markup.button.callback('📎 Да', 'yes_photo')],
      [Markup.button.callback('⛔ Нет', 'no_photo')],
    ]))

    return ctx.wizard.next()
  },

  // Обработка выбора добавлять фото или нет
  async (ctx) => {
    const action = (ctx.update as any)?.callback_query?.data
    if (action === 'yes_photo') {
      await ctx.reply('📤 Пожалуйста, отправьте изображение.')
      return ctx.wizard.next()
    } else {
      return showPreview(ctx)
    }
  },

  // Получение фото
  async (ctx) => {
    const photo =
      ctx.message && 'photo' in ctx.message ? ctx.message.photo?.at(-1) : null

    if (!photo) {
      return ctx.reply('❗ Пожалуйста, отправьте изображение.')
    }

    ; (ctx.wizard.state as any).photoId = photo.file_id
    return showPreview(ctx)
  }
)

achievementScene.action('confirm', async (ctx) => {
  const state = ctx.wizard.state as any
  const userId = ctx.from!.id.toString()

  await prisma.achievement.upsert({
    where: {
      userId: userId,
    },
    update: {
      fullName: state.fullName,
      school: state.school,
      position: state.position,
      text: state.text,
      photoId: state.photoId,
    },
    create: {
      userId,
      fullName: state.fullName,
      school: state.school,
      position: state.position,
      text: state.text,
      photoId: state.photoId,
    },
  })

  const admin = await prisma.admin.findFirst()

  if (!admin) {
    await ctx.reply('⚠️ Достижение сохранено. Но админ не назначен.')
    return ctx.scene.leave()
  }

  const caption =
    `📢 *Новое достижение*\n👤 ${state.fullName} (${state.position}, ${state.school})\n\n📌 ${state.text}`

  if (state.photoId) {
    await ctx.telegram.sendPhoto(admin.telegramId, state.photoId, {
      caption,
      parse_mode: 'Markdown',
    })
  } else {
    await ctx.telegram.sendMessage(admin.telegramId, caption, {
      parse_mode: 'Markdown',
    })
  }

  await ctx.reply('✅ Достижение отправлено. Спасибо!')
  return ctx.scene.leave()
})

achievementScene.action('edit', async (ctx) => {
  await ctx.reply('📌 Укажите ваше ФИО')
  return ctx.wizard.selectStep(1)
})

export default achievementScene
