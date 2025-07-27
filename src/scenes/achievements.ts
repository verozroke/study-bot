// src/scenes/achievements.ts
import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'
import { PrismaClient } from '@prisma/client'
import { escapeMarkdownV2 } from '../utils/escape'
const u = (s: string) => escapeMarkdownV2(s);
const prisma = new PrismaClient()
const schools = [
  'BINOM – им. К.Сатпаева', 'BINOM – им. А. Бөкейхана', 'BINOM – им. Қадыр Мырза Әлі',
  'BINOM – им. А. Байтұрсынұлы', 'BINOM – им. Ы. Алтынсарина', 'BINOM – им. Ә. Кекілбаева',
  'BINOM – им. Д. Қонаева', 'BINOM – им. Әл-Фараби', 'Quantum TECH', 'Quantum STEM',
  'Riviera Intellectual School', 'Farabi Шымкент', 'Farabi Атырау', 'BI Education'
]

const achievementScene = new Scenes.WizardScene<MyContext>(
  'achievement-wizard',

  // 0. ФИО и номер
  async (ctx) => {
    await ctx.reply(
      '📌 Укажите ваше ФИО и номер телефона:',
      Markup.keyboard([['❌ Отмена']]).oneTime().resize()
    )
    return ctx.wizard.next()
  },

  // 1. Сохраняем ФИО+телефон → школа
  async (ctx) => {
    if (!(ctx.message as any).text) {
      return ctx.reply('❗ Пожалуйста, введите текстом ФИО и номер.')
    }
    ; (ctx.wizard.state as any).fullNamePhone = (ctx.message as any).text
    await ctx.reply(
      '🏫 Выберите вашу школу:',
      Markup.keyboard(schools.map(s => [s])).oneTime().resize()
    )
    return ctx.wizard.next()
  },

  // 2. Школа → должность
  async (ctx) => {
    if (!(ctx.message as any).text || !schools.includes((ctx.message as any).text)) {
      return ctx.reply('❗ Пожалуйста, выберите школу из списка.')
    }
    ; (ctx.wizard.state as any).school = (ctx.message as any).text
    await ctx.reply(
      '👨‍🏫 Укажите вашу должность:',
      Markup.keyboard([['❌ Отмена']]).oneTime().resize()
    )
    return ctx.wizard.next()
  },

  // 3. Должность → что сделал
  async (ctx) => {
    if (!(ctx.message as any).text) {
      return ctx.reply('❗ Пожалуйста, введите вашу должность.')
    }
    ; (ctx.wizard.state as any).position = (ctx.message as any).text
    await ctx.reply(
      `📣 Давай расскажем о твоей идее или проекте, чтобы это стало вдохновением для других и помогло развивать культуру обмена опытом в нашей школе 😊

✍️ Расскажи коротко, в чём заключалась идея или проект?`,
      Markup.keyboard([['❌ Отмена']]).oneTime().resize()
    )
    return ctx.wizard.next()
  },

  // 4.1 Что сделал → что изменилось
  async (ctx) => {
    if (!(ctx.message as any).text) {
      return ctx.reply('❗ Пожалуйста, расскажите о проекте.')
    }
    ; (ctx.wizard.state as any).what = (ctx.message as any).text
    await ctx.reply(
      `✏️ Опиши, какие положительные изменения ты заметил(а) после реализации твоей идеи/проекта?

📌 Например: Дети стали обсуждать прочитанные книги вне уроков…`,
      Markup.keyboard([['❌ Отмена']]).oneTime().resize()
    )
    return ctx.wizard.next()
  },

  // 4.2 Что изменилось → прикрепить
  async (ctx) => {
    if (!(ctx.message as any).text) {
      return ctx.reply('❗ Пожалуйста, опишите изменения.')
    }
    ; (ctx.wizard.state as any).impact = (ctx.message as any).text
    await ctx.reply(
      `📎 Поделись фото или файлом (.pptx .pdf .docx .xlsx .txt) – 
- изображение с мероприятия  
- постер или схема  
- слайд из презентации`,
      Markup.keyboard([['❌ Отмена']]).oneTime().resize()
    )
    return ctx.wizard.next()
  },

  // 5. Фото или документ → предпросмотр
  async (ctx) => {
    const state = ctx.wizard.state as any

    // фото
    if ((ctx.message as any).photo) {
      const photo = (ctx.message as any).photo.at(-1)!
      state.fileType = 'photo'
      state.fileId = photo.file_id

      // документ
    } else if ((ctx.message as any).document) {
      const doc = (ctx.message as any).document
      const ext = doc.file_name?.split('.').pop()?.toLowerCase()
      if (!ext || !['pptx', 'pdf', 'docx', 'xlsx', 'txt'].includes(ext)) {
        return ctx.reply('❗ Формат не поддерживается.')
      }
      state.fileType = 'document'
      state.fileId = doc.file_id
      state.fileName = doc.file_name
    } else {
      return ctx.reply('❗ Пожалуйста, прикрепите фото или файл.')
    }

    // строим предпросмотр
    const { fullNamePhone, school, position, what, impact, fileType, fileName } = state
    let text =
      `📋 *Предпросмотр достижения*\n\n` +
      `👤 ${u(fullNamePhone)}\n` +
      `🏫 ${u(school)}\n` +
      `👔 ${u(position)}\n\n` +
      `✍️ *Что:* ${u(what)}\n` +
      `✏️ *Что изменилось:* ${u(impact)}\n\n`;
    text += fileType === 'photo'
      ? `📷 Фото прикреплено`
      : `📄 Файл: ${u(fileName || '')}`;

    await ctx.reply(text, {
      parse_mode: 'MarkdownV2',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('✅ Отправить', 'send')],
        [Markup.button.callback('❌ Отмена', 'cancel')],
      ]).reply_markup
    })
    return ctx.wizard.next()
  }
)

// Confirm / Cancel
achievementScene.action('send', async (ctx) => {
  const state = ctx.wizard.state as any
  const admin = await prisma.admin.findFirst()

  if (!admin) {
    await ctx.reply('❗ Админ не найден.')
    return ctx.scene.leave()
  }

  const summary =
    `📋 *Новое достижение*\n\n` +
    `👤 ${u(state.fullNamePhone)}\n` +
    `🏫 ${u(state.school)}\n` +
    `👔 ${u(state.position)}`

  const details =
    `✍️ *Что:*\n${u(state.what)}\n\n` +
    `✏️ *Что изменилось:*\n${u(state.impact)}`

  if (state.fileType === 'photo') {
    await ctx.telegram.sendPhoto(admin.telegramId, state.fileId, {
      caption: summary,
      parse_mode: 'MarkdownV2'
    })
    await ctx.telegram.sendMessage(admin.telegramId, details, {
      parse_mode: 'MarkdownV2'
    })
  } else if (state.fileType === 'document') {
    await ctx.telegram.sendDocument(admin.telegramId, state.fileId, {
      caption: summary + `\n\n📄 ${u(state.fileName)}`,
      parse_mode: 'MarkdownV2'
    })
    await ctx.telegram.sendMessage(admin.telegramId, details, {
      parse_mode: 'MarkdownV2'
    })
  }

  await ctx.reply('✅ Достижение отправлено. Спасибо!')
  return ctx.scene.leave()
})

achievementScene.action('cancel', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply('❌ Отменено.', Markup.removeKeyboard())
  return ctx.scene.leave()
})
achievementScene.hears('❌ Отмена', async (ctx) => {
  await ctx.reply('❌ Отменено.', Markup.removeKeyboard())
  return ctx.scene.leave()
})

export default achievementScene
