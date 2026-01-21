<script setup lang="ts">
const triplit = useTriplitClient()
const loading = ref(true)
const newTodoTitle = ref('')

onMounted(() => {
  loading.value = false
})

const { results: todos, clientFetching, unsubscribe } = await useQuery('todos', triplit, triplit.query('todos').Order('createdAt', 'ASC'))

if (todos.value === undefined) {
  throw new Error('undefined todos. Is the triplit server running?')
}

const addTodo = async () => {
  // TODO: for some reason trying to set { default: S.Default.now() } in the schema doesnt work
  // so we have to set the createdAt manually
  await triplit.insert('todos', { title: newTodoTitle.value, completed: false, createdAt: new Date().toISOString() })
  newTodoTitle.value = ''
}

const changeTodo = async (id: string, completed: boolean) => {
  await triplit.update('todos', id, { completed })
}

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <div>
    <p
      v-for="todo in todos"
      :key="todo.id"
    >
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="changeTodo(todo.id, ($event.target! as HTMLInputElement).checked)"
      >
      <span :class="[todo.completed && 'text-strike']">{{ todo.title }}</span>
    </p>
    <p v-if="todos!.length === 0">
      No Todos
    </p>
  </div>
  <form @submit.prevent="addTodo">
    <input
      v-model="newTodoTitle"
      type="text"
    >
    <button
      type="submit"
      :disabled="clientFetching"
    >
      Add Todo
    </button>
  </form>
</template>

<style scoped>
.text-strike {
    text-decoration: line-through;
}
</style>
