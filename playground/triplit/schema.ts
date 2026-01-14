import { Schema as S } from '@triplit/client'

export const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      title: S.String(),
      completed: S.Boolean(),
      createdAt: S.Date(),
    }),
  },
})
