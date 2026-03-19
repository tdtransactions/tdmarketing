
export type UserPermissions = {
  viewStores: boolean;
  createStores: boolean;
  editStores: boolean;
  deleteStores: boolean;
  manageUsers: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  password?: string;
  role: 'Admin' | 'Staff' | 'Manager';
  status: 'Active' | 'Inactive';
  permissions?: UserPermissions;
  createdAt: number;
  updatedAt?: number;
};
