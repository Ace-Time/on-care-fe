<script setup>
import { ref, onMounted } from 'vue';
import { getTodos, createTodo, completeTodo, uncompleteTodo, deleteTodo } from '@/api/careworker';
import TodoModal from './TodoModal.vue';

const todos = ref([]);
const isModalOpen = ref(false);
const loading = ref(true);

const loadTodos = async () => {
  try {
    const response = await getTodos();
    const list = Array.isArray(response?.data?.data)
      ? response.data.data
      : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

    todos.value = list.map((todo) => ({
      id: todo.todoId,
      text: todo.content ?? todo.todo ?? '',
      checked: todo.isCompleted,
      dueDate: todo.dueDate ?? todo.todoDate,
    }));
  } catch (error) {
    console.error('할 일 목록 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

// 할 일 추가
const handleAddTodo = async ({ content, type }) => {
  try {
    const newTodo = {
      todo: content,
      todoDate: new Date().toISOString().split('T')[0],
      type: type || null,
    };
    await createTodo(newTodo);
    isModalOpen.value = false; // 추가 완료 후 모달 닫기
    await loadTodos();
  } catch (error) {
    console.error('할 일 추가 실패:', error);
  }
};

// 할 일 완료/미완료 토글
const toggleTodo = async (todo) => {
  try {
    if (todo.checked) {
      await uncompleteTodo(todo.id);
    } else {
      await completeTodo(todo.id);
    }
    todo.checked = !todo.checked;
  } catch (error) {
    console.error('할 일 상태 변경 실패:', error);
  }
};

// 할 일 삭제
const removeTodo = async (id) => {
  try {
    await deleteTodo(id);
    todos.value = todos.value.filter(todo => todo.id !== id);
  } catch (error) {
    console.error('할 일 삭제 실패:', error);
  }
};

onMounted(() => {
  loadTodos();
});
</script>

<template>
  <section class="todo-section">
    <div class="header-row">
      <h2 class="section-title">☑️ 할 일 목록</h2>
      <button class="add-btn-small" @click="isModalOpen = true">+ 할 일 추가</button>
    </div>

    <ul class="todo-list">
      <li v-if="loading" class="empty-state">
        할 일을 불러오는 중...
      </li>
      <li v-else-if="todos.length === 0" class="empty-state">
        할 일이 없습니다.
      </li>
      <li v-else v-for="todo in todos" :key="todo.id" class="todo-item">
        <div class="todo-left">
          <input type="checkbox" :checked="todo.checked" @change="toggleTodo(todo)" class="checkbox" />
          <span :class="['todo-text', { 'completed': todo.checked }]">
            {{ todo.text }}
          </span>
        </div>
        <div class="todo-actions">
          <button class="icon-btn edit">✏️</button>
          <button class="icon-btn delete" @click="removeTodo(todo.id)">🗑️</button>
        </div>
      </li>
    </ul>

    <TodoModal
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @add="handleAddTodo"
    />
  </section>
</template>

<style scoped>
.todo-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
}

.add-btn-small {
  background-color: #22c55e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.add-btn-small:hover {
  background-color: #16a34a;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 0.5rem;
}

.todo-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #16a34a;
  cursor: pointer;
}

.todo-text {
  font-size: 0.95rem;
  color: #374151;
}

.todo-text.completed {
  text-decoration: line-through;
  color: #9ca3af;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.icon-btn:hover {
  background-color: #e5e7eb;
}

.edit { color: #3b82f6; }
.delete { color: #ef4444; }

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 1rem;
  font-size: 0.875rem;
}
</style>
