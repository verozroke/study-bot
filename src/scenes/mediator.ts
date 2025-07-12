// src/scenes/mediator.ts
import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'
import { query } from '../utils/genai/query'
import { generatePrompt } from '../utils/genai/prompt'
import { splitMessage } from '../utils/split-messages'

const mediatorScene = new Scenes.WizardScene<MyContext>(
  'mediator-wizard',

  // Шаг 1: Выбор типа ситуации
  async (ctx) => {
    await ctx.reply('🔍 Выберите тип ситуации:', Markup.inlineKeyboard([
      [Markup.button.callback('🧑‍🎓 С учеником', 'student')],
      [Markup.button.callback('👨‍👩‍👧 С родителем', 'parent')],
      [Markup.button.callback('🧑‍🤝‍🧑 С коллегой', 'colleague')],
    ]))
    return ctx.wizard.next()
  },

  // Шаг 2: Уточнение контекста (текст/голос)
  async (ctx) => {
    const data = (ctx.callbackQuery as any)?.data
    if (!data) return ctx.reply('❗ Пожалуйста, выберите тип ситуации.');
    (ctx.wizard.state as any).type = data

    await ctx.reply('📝 Опишите ситуацию или запишите голосовое сообщение (до 300 символов).')
    return ctx.wizard.next()
  },

  // Шаг 3: Ответ (заглушка)
  async (ctx) => {
    if ('voice' in (ctx.message || {})) {

      const voice = (ctx.message as any).voice;
      console.log('Получено голосовое сообщение:', voice.file_id);
      (ctx.wizard.state as any).context = '[голосовое сообщение]';

    } else if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).context = (ctx.message as any).text;

    } else {

      return ctx.reply('❗ Пожалуйста, отправьте текст или голосовое сообщение.')
    }
    // TODO: get the transcript from the audio or pass the text as param to the query

    // TODO: generate keyboard of yes or no 

    // TODO: ctx.reply of the query content and pass the keyboad

    const state = ctx.wizard.state as any
    const propmpt = generatePrompt({ category: state.type, context: state.context })
    const message = await query(propmpt)
    const parts = splitMessage(message)
    for (const part of parts) {
      await ctx.reply(part, { parse_mode: 'HTML' })
    }

    await ctx.reply('📊 Был ли этот ответ полезен?', Markup.inlineKeyboard([
      [Markup.button.callback('👍 Да', 'feedback_yes')],
      [Markup.button.callback('👎 Нет', 'feedback_no')],
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

export default mediatorScene
