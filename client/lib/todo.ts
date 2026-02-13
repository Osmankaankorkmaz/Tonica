export type TodoStatus = "todo" | "doing" | "done";

export interface TodoItem {
  id: string;
  title: string;
  status: TodoStatus;
  createdAt: string; // ISO
}
