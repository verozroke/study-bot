// src/scenes/mediator.ts
import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'

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
      // Заглушка — здесь будет обработка голосового сообщения

      console.log('Получено голосовое сообщение:', voice.file_id);
      (ctx.wizard.state as any).context = '[голосовое сообщение]';
    } else if ('text' in (ctx.message || {})) {
      (ctx.wizard.state as any).context = (ctx.message as any).text;
    } else {
      return ctx.reply('❗ Пожалуйста, отправьте текст или голосовое сообщение.')
    }

    await ctx.reply('🤖 Здесь будет ответ от Gemini (ИИ подсказка)')

    // Завершить сцену
    return ctx.scene.leave()
  }
)

export default mediatorScene
