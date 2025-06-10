import { Context } from '../context'

declare module 'express' {
  interface Request {
    context: Context
  }
}
