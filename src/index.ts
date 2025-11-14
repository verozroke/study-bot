import { Telegraf, Context, Markup, Scenes, session } from 'telegraf'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

import handleRahmetiki from './handlers/rahmetiki'
// import handleAchievements from './handlers/achievements'
import handleNomination from './handlers/nomination'
// import handleMediator from './handlers/mediator'
import handleFeedback from './handlers/feedback'
import rahmetikScene from './scenes/rahmetiki'
import { MyContext } from './types/bot'
import { setAdmin } from './commands/set-admin'
import { setChannel } from './commands/set-channel'
import feedbackScene from './scenes/feedback'
import nominationScene from './scenes/nomination'
// import achievementScene from './scenes/achievements'
// import mediatorScene from './scenes/mediator'

dotenv.config()

const WELCOME_TEXT_KZ = `
Мен — BI Education командасы жасаған  ботпын. Күн сайын жаныңда болып, көмектесуге және қолдау көрсетуге дайынмын.

Мен келесі бағыттар бойынша маңызды бола аламын: 👇

1. Алғыс сөздері ✉️
Әріптесіңе алғыс білдіріп, ашық хат жібере аласың. Жылы сөз — ұжымды біріктіретін үлкен күш.

2. Құндылықтар елшісі 🏅  
Құндылықтарды күнделікті іс-әрекетінде басшылыққа алатын әріптесіңді номинацияла.  
Жыл соңында әр мектептен ТОП-5 ұстаз арнайы сыйлық алады — Компания есебінен екі адамға арналған сапар ✈️

3. Кері байланыс 💬
Сұрағың, ойың немесе ұсынысың болса — жаз. HR командасы оны міндетті түрде оқып, саған жеке жауап береді.

Бастаймыз ба? Мәзірден қажетті бағытты таңда!
`
const WELCOME_TEXT_RU = `
Я — бот, созданный командой BI Education, чтобы поддерживать тебя и быть рядом каждый день.

Я могу быть полезен в следующих направлениях: 👇

1. Слова благодарности ✉️
Ты можешь поблагодарить коллегу и отправить ему открытку. Тёплые слова — это большая сила, объединяющая команду.

2. Амбассадор ценностей 🏅
Номинируй коллегу, который ежедневно проявляет корпоративные ценности. В конце года ТОП-5 педагогов каждой школы получают специальный приз — путешествие на двоих за счёт Компании ✈️

3. Обратная связь 💬
Если у тебя есть вопрос, мнение или предложение — напиши нам. Команда HR обязательно прочитает его и ответит тебе лично.

Готовы начать? Выберите в меню нужное направление!
`

const menuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('Алғыс сөз', 'RAHMETIKI')],
  // [Markup.button.callback('Достижения', 'ACHIEVEMENTS')],
  //  [Markup.button.callback('Медиатор', 'MEDIATOR')],
  [Markup.button.callback('Амбассадор ценностей', 'NOMINATION')],
  [Markup.button.callback('Обратная связь', 'FEEDBACK')],
])


const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!)
const prisma = new PrismaClient()

bot.start(async (ctx) => {
  const user = ctx.from
  await prisma.user.upsert({
    where: { telegramId: user.id.toString() },
    update: {},
    create: {
      telegramId: user.id.toString(),
      username: user.username || null,
    }
  })

  ctx.reply(`
    Құрметті ${user.first_name}! 
    ${WELCOME_TEXT_KZ}
  `, menuKeyboard)

  ctx.reply(`
    Уважаемый ${user.first_name}!
    ${WELCOME_TEXT_RU}
  `, menuKeyboard)
})


bot.command('menu', async (ctx) => {
  ctx.reply(`Нажмите на кнопку внизу и мы начнем!`, menuKeyboard)
})


const stage = new Scenes.Stage<MyContext>([
  rahmetikScene,
  feedbackScene,
  nominationScene,
  // achievementScene,
  //  mediatorScene
])

bot.use(session())
bot.use(stage.middleware())
bot.action('RAHMETIKI', handleRahmetiki)
// bot.action('ACHIEVEMENTS', handleAchievements)
// bot.action('MEDIATOR', handleMediator)
bot.action('FEEDBACK', handleFeedback)
bot.action('NOMINATION', handleNomination)
bot.command('setadmin', setAdmin)
bot.command('setchannel', setChannel)
bot.launch()


console.log('Bot is running')
