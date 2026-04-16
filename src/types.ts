export interface KnowledgePoint {
  id: string;
  category: string;
  subCategory: string;
  name: string;
  grade: string;
}

export interface CategoryStats {
  total: number;
  completed: number;
}

export type ViewType = 'dashboard' | 'learning';
