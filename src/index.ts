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

dotenv.config()

const WELCOME_TEXT = `
Я — бот, созданный HR-командой BI Education, чтобы поддерживать тебя, вдохновлять и быть рядом каждый день.

Закрепи меня в верхней части чатов, чтобы не пропустить новости, события и я постараюь быть полезным тебе!

Вот, чем я могу быть полезен 👇

1) Рахметики
Ты можешь отправить открытку-благодарность своему коллеге.
Её увидят все — ведь слова благодарности и поддержки так важны!

2) Достижения
Расскажи о своём проекте, победе или событии, даже небольшими или только начавшимся и мы поделимся этим в Instagram BI Education.
Все участники рубрики в конце года будут номинированы на звание «Учитель года» 🎓

3) Медиатор 
Совместно с ИИ я помогу найти подход:
— как поддержать диалог с ребёнком в сложной ситуации
— как корректно поговорить с родителями
— или просто взглянуть на ситуацию со стороны

4) Обратная связь
Поделись идеей, задай вопрос или оставь обратную связь. Сообщение получит сотрудник HR BI education и вернется к вам в личном сообщении

Готов? Нажми на кнопку внизу или напиши, с чего начнём!
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

const stage = new Scenes.Stage<MyContext>([rahmetikScene])
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
