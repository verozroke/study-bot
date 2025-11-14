import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../types/bot'
import { saveNomination } from '../utils/nomination/save-nomination'

const schools = [
  "Aldi BI",
  "BINOM - им. К.Сатпаева",
  "BINOM - им. А. Бөкейхана",
  "BINOM - им. Қадыр Мырза Әлі",
  "BINOM - им. А. Байтұрсынұлы",
  "BINOM - им. Ы. Алтынсарина",
  "BINOM - им. Ә. Кекілбаева",
  "BINOM - им. Д. Қонаева",
  "BINOM - им. Әл-Фараби",
  "УК BINOM",
  "FARABI Шымкент",
  "FARABI Атырау",
  "УК FARABI",
  "RIVIERA International school",
  "Quantum TECH",
  "Quantum STEM",
  "QMC",
  "BI Education"
];

const nominationScene = new Scenes.WizardScene<MyContext>(
  'nomination-wizard',

  // Шаг 0 — стартовое сообщение
  async (ctx) => {
    await ctx.reply(
      `Программа «Амбассадор ценностей» — это ежегодное признание педагогов, которые каждый день вдохновляют своим примером и демонстрируют наши ценности в работе и общении 💚 

ТОП-5 Амбассадоров отправятся в путешествие вместе с близким человеком за счёт Компании ✈️

Вы можете номинировать одного или нескольких коллег. 

Выберите действие:`,
      Markup.inlineKeyboard([
        [Markup.button.callback('ℹ️ Ознакомиться с критериями', 'NOM_CRITERIA')],
        [Markup.button.callback('🏅 Номинировать коллегу', 'NOM_START')]
      ])
    )
  },

  // Шаг 1 — ФИО автора
  async (ctx) => {
    if (!('text' in ((ctx.message as any) ?? {}))) return
    (ctx.wizard.state as any).authorFullname = (ctx.message as any).text
    await ctx.reply(
      '🏫 Выберите организацию, в которой работает ваш коллега:',
      Markup.keyboard(schools.map(s => [s])).resize().oneTime()
    )
    return ctx.wizard.next()
  },

  // Шаг 2 — школа
  async (ctx) => {
    if (!('text' in ((ctx.message as any) ?? {}))) return
    (ctx.wizard.state as any).colleagueSchool = (ctx.message as any).text
    await ctx.reply('✍️ Укажите должность коллеги:')
    return ctx.wizard.next()
  },

  // Шаг 3 — должность
  // Шаг 3 — должность
  async (ctx) => {
    if (!('text' in ((ctx.message as any) ?? {}))) return
    (ctx.wizard.state as any).colleaguePosition = (ctx.message as any).text

    const imagePath = require('path').resolve(__dirname, '../assets/nomination/image.png')

    await ctx.replyWithPhoto(
      { source: imagePath },
      {
        caption: `Хорошо 💚  
Ознакомьтесь с ценностями Компании для дальнейшего описания «Почему номинант носитель наших ценностей?»`,
        reply_markup: {
          inline_keyboard: [
            [{ text: '✨ Начать описание', callback_data: 'NOM_DESC' }]
          ]
        }
      }
    )

    return ctx.wizard.next()
  },

  // Шаг 4 — описание
  async (ctx) => {
    if (!('text' in ((ctx.message as any) ?? {}))) return
    const text = (ctx.message as any).text

    if (text.length < 30) {
      return ctx.reply(
        `Необходимо закончить описание. 
        Просим написать несколько предложений почему выдвенутый вами номинант соответствует званию "Амбассадор ценностей`
      )
    }

    (ctx.wizard.state as any).description = text

    await saveNomination(ctx.wizard.state)

    await ctx.reply(
      `Номинация успешно отправлена 💚

Спасибо, что укрепляете культуру признания в BI Education.`,
      Markup.removeKeyboard()
    )

    return ctx.scene.leave()
  }
)


// === КНОПКИ ===

// начать заполнение
nominationScene.action('NOM_START', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply(`Для начала расскажите немного о себе 😊
✍️ Введите ваше ФИО:`, Markup.removeKeyboard())
  return ctx.wizard.selectStep(1)
})

// начать описание
nominationScene.action('NOM_DESC', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply(
    `✍️ Опишите, почему вы считаете этого человека достойным звания «Амбассадор ценностей». 💌

Пожалуйста, приведите конкретный пример поведения или историю из случаев в жизни. Описание должно содердать не менее 3-4 предложений.`
  )
  return ctx.wizard.selectStep(4)
})

// критерии
nominationScene.action('NOM_CRITERIA', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply(
    `Номинант "Амбассадор ценностей":

• Демонстрирует ценности через действия, отношения и вклад в сообщество
• Работает в школе больше 1 года
• У него нет дисциплинарных взысканий и случаев нарушения этического поведения
• Не планирует покинуть компанию в ближайщий год
• Не является директором, и.о. директора или заместителем директора

Если ваш коллега соответствует этим критериям — вы можете перейти к номинации 💚`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🏅 Номинировать коллегу', 'NOM_START')],
      [Markup.button.callback('❌ Отмена', 'NOM_CANCEL')]
    ])
  )
})

// отмена
nominationScene.action('NOM_CANCEL', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply('❌ Действие отменено.', Markup.removeKeyboard())
  return ctx.scene.leave()
})

export default nominationScene
