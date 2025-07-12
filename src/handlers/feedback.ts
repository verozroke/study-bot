import { MyContext } from '../types/bot'

export default async function handleFeedback(ctx: MyContext) {
  await ctx.scene.enter('feedback-wizard')
}
