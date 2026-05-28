import { supabase, isSupabaseConfigured } from './supabase';
import { Todo } from '../types';

// --------------------------------------------------
// 统一的 Todo 持久化层
// 内部判断 Supabase / localStorage，对外暴露相同接口
// --------------------------------------------------

const LOCAL_KEY = 'funtools-todos';

// ── localStorage 读写 ──
function readLocal(): Todo[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(todos: Todo[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(todos));
}

// ── 对外 API ──

/** 获取所有 Todo（按创建时间倒序） */
export async function loadTodos(): Promise<Todo[]> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    return data ?? [];
  }
  return readLocal();
}

/** 创建一条新 Todo，返回数据库/本地生成的完整对象 */
export async function createTodo(text: string): Promise<Todo> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('todos')
      .insert({ text, completed: false })
      .select()
      .maybeSingle();
    return data!;
  }
  // 本地模式：手动组装 Todo 对象
  const newTodo: Todo = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    created_at: new Date().toISOString(),
  };
  const all = [newTodo, ...readLocal()];
  writeLocal(all);
  return newTodo;
}

/** 切换某条 Todo 的完成状态 */
export async function updateTodoCompletion(id: string, completed: boolean, completedAt: string | null): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('todos').update({ completed, completed_at: completedAt }).eq('id', id);
    return;
  }
  const all = readLocal().map((t) =>
    t.id === id ? { ...t, completed, completed_at: completedAt ?? undefined } : t
  );
  writeLocal(all);
}

/** 删除单条 Todo */
export async function removeTodo(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('todos').delete().eq('id', id);
    return;
  }
  writeLocal(readLocal().filter((t) => t.id !== id));
}

/** 批量清除已完成 Todo */
export async function removeCompletedTodos(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  if (isSupabaseConfigured && supabase) {
    await supabase.from('todos').delete().in('id', ids);
    return;
  }
  writeLocal(readLocal().filter((t) => !ids.includes(t.id)));
}
