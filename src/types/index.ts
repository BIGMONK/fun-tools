export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

export type TabId = 'tree' | 'wheel' | 'tetris' | 'todo' | 'pomodoro' | 'dice' | 'tarot';

export interface TabItem {
  id: TabId;
  label: string;
  icon: string;
  color: string;
}
