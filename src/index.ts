import { Telegraf, Context, Markup, Scenes, session } from 'telegraf'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

import handleRahmetiki from './handlers/rahmetiki'
import handleAchievements from './handlers/achievements'
import handleMediator from './handlers/mediator'
import handleFeedback from './handlers/feedback'
import rahmetikScene from './scenes/rahmetiki'
import { MyContext } from './types/bot'
import { setAdmin } from './commands/set-admin'
import { setChannel } from './commands/set-channel'
import feedbackScene from './scenes/feedback'
import achievementScene from './scenes/achievements'
import mediatorScene from './scenes/mediator'

dotenv.config()

const WELCOME_TEXT = `
Мен — BI Education командасы жасаған БОТпын. Күн сайын жаныңда болып, көмектесуге және қолдау көрсетуге дайынмын.

Мен келесі бағыттар бойынша маңызды бола аламын: 👇

1️⃣ Алғыс сөздері
Әріптесіңе алғыс білдіріп, ашық хат жібере аласың. Жылы сөз — ұжымды біріктіретін үлкен күш.

2️⃣ Жетістіктер
Жетістігіңмен немесе бастамаларыңмен бөліс — тіпті шағын болса да. Жыл соңында белсенді ұстаздар «Жаңашыл ұстаз» номинациясына қатысады. 

3️⃣ Медиатор
Бала, ата-ана немесе әріптеспен сөйлесу қиынға соқты ма? Жағдайға сырт көзбен қарап, дұрыс шешім табуға көмектесемін.

4️⃣ Кері байланыс
Сұрағың, ойың немесе ұсынысың болса — жаз. HR командасы оны міндетті түрде оқып, саған жеке жауап береді.

Бастаймыз ба? Төменде керек бастаманы бас!
`

const menuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('Рахметики', 'RAHMETIKI')],
  [Markup.button.callback('Достижения', 'ACHIEVEMENTS')],
  [Markup.button.callback('Медиатор', 'MEDIATOR')],
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
    ${WELCOME_TEXT}
  `, menuKeyboard)
})


bot.command('menu', async (ctx) => {
  ctx.reply(`Нажми на кнопку внизу и мы начнем!`, menuKeyboard)
})

const stage = new Scenes.Stage<MyContext>([rahmetikScene, feedbackScene, achievementScene, mediatorScene])


bot.use(session())
bot.use(stage.middleware())
bot.action('RAHMETIKI', handleRahmetiki)
bot.action('ACHIEVEMENTS', handleAchievements)
bot.action('MEDIATOR', handleMediator)
bot.action('FEEDBACK', handleFeedback)
bot.command('setadmin', setAdmin)
bot.command('setchannel', setChannel)
bot.launch()


console.log('Bot is running')
