import { StoreEntry } from "@/types/store";

/**
 * Kiểm tra xem hồ sơ tiệm có bị thiếu thông tin hay không.
 * Yêu cầu: Phải điền đầy đủ tất cả các trường ngoại trừ 'note'.
 */
export function isStoreIncomplete(store: StoreEntry): boolean {
  const requiredFields: (keyof StoreEntry)[] = [
    'startDate',
    'endDate',
    'storeName',
    'customerName',
    'address',
    'customerPhone',
    'package',
    'salesPerson',
    'paymentTypes',
    'amount',
    'facebookLink',
    'instagramLink',
    'googleWebsiteLink',
    'googleBusinessLink'
  ];
  
  // Kiểm tra các trường cơ bản
  const missingBasicField = requiredFields.some(field => {
    const value = store[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  // Kiểm tra riêng phần assignedTo (mảng người phụ trách)
  const assigned = store.assignedTo;
  let noAssignedUser = true;

  if (Array.isArray(assigned)) {
    noAssignedUser = assigned.length === 0;
  } else if (typeof assigned === 'string' && (assigned as string).trim() !== '') {
    noAssignedUser = false;
  }

  return missingBasicField || noAssignedUser;
}

export function getStatusColor(store: StoreEntry) {
  if (isStoreIncomplete(store)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
}
