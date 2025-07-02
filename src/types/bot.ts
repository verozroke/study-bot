import { Scenes } from 'telegraf'

export interface MySession extends Scenes.WizardSessionData {
  style?: string
  recipient?: string
  message?: string
}

export type MyContext = Scenes.WizardContext<MySession>
