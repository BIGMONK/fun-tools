import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, ClipboardList, Circle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Todo } from '../types';

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚才';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 30) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type Filter = 'all' | 'active' | 'done';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTodos(data);
    setLoading(false);
  }

  async function addTodo() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    const { data } = await supabase
      .from('todos')
      .insert({ text, completed: false })
      .select()
      .maybeSingle();
    if (data) setTodos((prev) => [data, ...prev]);
  }

  async function toggleTodo(id: string, completed: boolean) {
    const newCompleted = !completed;
    await supabase.from('todos').update({
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null
    }).eq('id', id);
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? {
        ...t,
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      } : t))
    );
  }

  async function deleteTodo(id: string) {
    await supabase.from('todos').delete().eq('id', id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  async function clearCompleted() {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    await supabase.from('todos').delete().in('id', completedIds);
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-xl mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">待办事项</h2>
        <p className="text-gray-400">把要做的事都记下来，一件一件完成</p>
      </div>

      <div className="w-full flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新的待办事项..."
          className="flex-1 bg-gray-800 border border-gray-600 focus:border-emerald-500 text-white rounded-xl px-4 py-3 outline-none transition-colors placeholder-gray-500"
        />
        <button
          onClick={addTodo}
          disabled={!input.trim()}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="w-full flex gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
        {(['all', 'active', 'done'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {f === 'all' ? `全部 (${todos.length})` : f === 'active' ? `进行中 (${activeCount})` : `已完成 (${completedCount})`}
          </button>
        ))}
      </div>

      <div className="w-full flex flex-col gap-2">
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto mb-3 text-gray-600" />
            <p className="text-gray-500">
              {filter === 'all' ? '暂无待办事项，添加一个吧' : filter === 'active' ? '没有进行中的事项' : '还没有完成的事项'}
            </p>
          </div>
        ) : (
          filtered.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all group ${
                todo.completed
                  ? 'bg-gray-800/40 border-gray-700/50'
                  : 'bg-gray-800 border-gray-700 hover:border-emerald-700'
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id, todo.completed)}
                className="flex-shrink-0 transition-colors"
              >
                {todo.completed ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                ) : (
                  <Circle size={24} className="text-gray-500 hover:text-emerald-400 transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span
                  className={`block text-sm transition-all ${
                    todo.completed ? 'line-through text-gray-500' : 'text-gray-200'
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    创建于 {formatTime(todo.created_at)}
                  </span>
                  {todo.completed && todo.completed_at && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      ✓ 完成于 {formatTime(todo.completed_at)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {completedCount > 0 && (
        <button
          onClick={clearCompleted}
          className="text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          清除所有已完成事项 ({completedCount})
        </button>
      )}

      {todos.length > 0 && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>完成进度</span>
            <span>{completedCount}/{todos.length}</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${todos.length ? (completedCount / todos.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
