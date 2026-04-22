export type InternalStaff = {
  id?: string;
  name: string;
  email?: string;
  roles: string[]; // e.g., ['POS', 'Marketing', 'Sale']
  createdAt?: number;
};
