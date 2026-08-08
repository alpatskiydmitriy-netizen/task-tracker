export interface TaskDTO {
  id: number;
  title: string;
  description: string | null;
  status: string;
  importance: string;
  urgency: string;
  categoryId: number | null;
  categoryName: string | null;
  assignee: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  id: number;
  name: string;
}
