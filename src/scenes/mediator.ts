// src/scenes/mediator.ts
import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'
import { query } from '../utils/genai/query'
import { generatePrompt } from '../utils/genai/prompt'
import { splitMessage } from '../utils/split-messages'
import path from 'path'
import axios from 'axios'
import fs from 'fs'
import { getTranscript, upload } from '../utils/genai/voice'

const mediatorScene = new Scenes.WizardScene<MyContext>(
  'mediator-wizard',

  // Шаг 1: Выбор типа ситуации
  async (ctx) => {
    await ctx.reply('🔍 Выберите тип ситуации:', Markup.inlineKeyboard([
      [Markup.button.callback('🧑‍🎓 С учеником', 'student')],
      [Markup.button.callback('👨‍👩‍👧 С родителем', 'parent')],
      [Markup.button.callback('🧑‍🤝‍🧑 С коллегой', 'colleague')],
      [Markup.button.callback('❌ Отмена', 'cancel')]
    ]))
    return ctx.wizard.next()
  },

  // Шаг 2: Уточнение контекста (текст/голос)
  async (ctx) => {
    const data = (ctx.callbackQuery as any)?.data
    if (!data) return ctx.reply('❗ Пожалуйста, выберите тип ситуации.');
    (ctx.wizard.state as any).type = data

    await ctx.reply('📝 Опишите ситуацию или запишите голосовое сообщение (до 300 символов).', Markup.keyboard([
      ['❌ Отмена']
    ]).oneTime().resize())
    return ctx.wizard.next()
  },

  // Шаг 3: Ответ
  async (ctx) => {
    let voicePath: string | null = null
    if ('voice' in (ctx.message || {})) {

      const voice = (ctx.message as any).voice;
      const fileId = voice.file_id;

      // Получаем file_path от Telegram
      const fileInfo = await ctx.telegram.getFile(fileId)
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`

      // Локальный путь для сохранения .ogg
      const fileName = `${fileId}.ogg`
      voicePath = path.join(__dirname, '..', 'temp', fileName)

      // Скачиваем файл
      const response = await axios.get(fileUrl, { responseType: 'stream' })
      await new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(voicePath as string)
        response.data.pipe(stream)
        //@ts-ignore
        stream.on('finish', resolve)
        stream.on('error', reject)
      })

      const file = await upload(voicePath)
      const transcript = await getTranscript(file);
      (ctx.wizard.state as any).context = transcript

    } else if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).context = (ctx.message as any).text;

    } else {

      return ctx.reply('❗ Пожалуйста, отправьте текст или голосовое сообщение.')
    }

    const state = ctx.wizard.state as any
    const propmpt = generatePrompt({ category: state.type, context: state.context })
    const message = await query(propmpt)

    console.log(message)
    const parts = splitMessage(message)
    for (const part of parts) {
      await ctx.reply(part, { parse_mode: 'HTML' })
    }

    await ctx.reply('📊 Был ли этот ответ полезен?', Markup.inlineKeyboard([
      [Markup.button.callback('👍 Да', 'feedback_yes')],
      [Markup.button.callback('👎 Нет', 'feedback_no')],
      [Markup.button.callback('❌ Отмена', 'cancel')]
    ]))


    return ctx.wizard.next()
  },
  async (ctx) => {
    const feedback = (ctx.callbackQuery as any)?.data

    if (feedback === 'feedback_yes') {
      await ctx.reply('🙏 Спасибо за использование медиатора! Надеемся, мы помогли.')
      return ctx.scene.leave()
    }

    if (feedback === 'feedback_no') {
      await ctx.reply('📝 Попробуйте описать ситуацию подробнее или под другим углом.')
      return ctx.wizard.selectStep(2) // вернуть пользователя на шаг с вводом текста/аудио
    }

    return ctx.reply('❗ Пожалуйста, выберите "Да" или "Нет".')
  }
)


mediatorScene.hears('❌ Отмена', async (ctx) => {
  await ctx.reply('❌ Действие отменено.', Markup.removeKeyboard())
  return ctx.scene.leave()
})

mediatorScene.action('cancel', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.editMessageText('❌ Действие отменено.')
  return ctx.scene.leave()
})


export default mediatorScene
