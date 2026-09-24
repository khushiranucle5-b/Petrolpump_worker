/**
 * Customer and Group Information Types
 */

export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'blocked';
export type GroupType = 'Family Group' | 'Corporate Fleet' | 'Taxi Union' | 'Logistics Partner' | 'Premium VIP' | 'Standard';

export interface CustomerGroupInfo {
  groupId: string;
  groupName: string;
  groupType: GroupType;
  discountPercentage: number; // e.g., 10 for 10%
  description?: string;
}

export interface CustomerProfile {
  id: string;
  customerId: string; // e.g. "CUST-4412"
  fullName: string;
  mobileNumber: string;
  email?: string;
  profilePhotoUrl?: string;
  vehicleNumber?: string;
  fuelPreference?: 'Petrol (Normal)' | 'Petrol (Speed/Power)' | 'Diesel' | 'CNG';
  group: CustomerGroupInfo;
  status: CustomerStatus;
  joinedDate: string;
  totalRedemptions?: number;
}
