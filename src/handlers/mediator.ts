import { MyContext } from "../types/bot"

export default async function mediatorHandler(ctx: MyContext) {
  await ctx.answerCbQuery()
  try {
    await ctx.scene.enter('mediator-wizard')
  } catch (e) {
    console.error('Ошибка при запуске медиатора:', e)
    await ctx.reply('❗ Не удалось запустить сценарий. Попробуйте позже.')
  }
}
