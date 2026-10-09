import { WorkerUser } from '../../types/auth';
import { CustomerProfile } from '../../types/customer';
import { Transaction } from '../../types/transaction';

export const INITIAL_MOCK_WORKER: WorkerUser = {
  id: '',
  workerId: '',
  fullName: '',
  email: '',
  mobileNumber: '',
  petrolPumpId: '',
  petrolPumpName: '',
  branchName: '',
  role: 'Worker',
  joiningDate: '',
  accountStatus: 'active',
  createdAt: '',
  updatedAt: '',
};

export const MOCK_CUSTOMERS: CustomerProfile[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
