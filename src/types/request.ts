export type SalesRequest = {
  id?: string;
  title: string;
  description?: string;
  priority: "normal" | "urgent";
  status: "new" | "accepted" | "pending" | "completed" | "closed";
  salesName: string;
  workType: string;
  assignedStaff?: string;
  adminNote?: string;
  adminNoteUpdatedAt?: number | any;
  createdAt?: number | any;
  updatedAt?: number | any;
  completedAt?: number | any;
  closedAt?: number | any;
};
