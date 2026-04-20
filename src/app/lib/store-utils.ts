import { StoreEntry } from "@/types/store";

/**
 * Kiểm tra xem hồ sơ tiệm có bị thiếu thông tin hay không.
 * Yêu cầu: Phải điền đầy đủ tất cả các trường ngoại trừ 'note'.
 */
export function isStoreIncomplete(store: StoreEntry): boolean {
  const type = store.serviceType || 'both';
  
  const basicFields: (keyof StoreEntry)[] = [
    'startDate', 'endDate', 'storeName', 'customerName', 'address', 
    'customerPhone', 'package', 'salesPerson', 'paymentTypes', 'amount'
  ];

  const socialFields: (keyof StoreEntry)[] = ['facebookLink', 'instagramLink', 'googleBusinessLink'];
  const websiteFields: (keyof StoreEntry)[] = ['googleWebsiteLink'];

  const checkFields = (fields: (keyof StoreEntry)[]) => 
    fields.some(field => {
      const value = store[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

  const basicMissing = checkFields(basicFields);
  
  let contentMissing = false;
  if (type === 'both') {
    contentMissing = checkFields(socialFields) || checkFields(websiteFields);
  } else if (type === 'social') {
    contentMissing = checkFields(socialFields);
  } else if (type === 'website') {
    contentMissing = checkFields(websiteFields);
  }

  const assigned = store.assignedTo;
  let noAssignedUser = true;
  if (Array.isArray(assigned)) {
    noAssignedUser = assigned.length === 0;
  } else if (typeof assigned === 'string' && (assigned as string).trim() !== '') {
    noAssignedUser = false;
  }

  return basicMissing || contentMissing || noAssignedUser;
}

export function getStatusColor(store: StoreEntry) {
  if (isStoreIncomplete(store)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
}
