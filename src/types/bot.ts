import { Scenes } from 'telegraf'

export interface MySession extends Scenes.WizardSessionData {
  style?: string
  recipient?: string
  message?: string
  sender?: string
  type?: string
  text?: string
  fullName?: string
  school?: string
  position?: string
  photoId?: string
}

export type MyContext = Scenes.WizardContext<MySession>
