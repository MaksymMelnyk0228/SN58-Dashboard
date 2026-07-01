export const ENTITY_STATUSES = ['active', 'inactive', 'jailed'] as const;
export type EntityStatus = (typeof ENTITY_STATUSES)[number];

export const ACTIVITY_ENTITY_TYPES = ['miner', 'validator', 'system'] as const;
export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

export const MINER_SORT_FIELDS = ['score', 'rank', 'emissions', 'updatedAt', 'uid'] as const;
export type MinerSortField = (typeof MINER_SORT_FIELDS)[number];

export const VALIDATOR_SORT_FIELDS = ['stake', 'rank', 'emissions', 'updatedAt', 'uid'] as const;
export type ValidatorSortField = (typeof VALIDATOR_SORT_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export interface PerformancePoint {
  recordedAt: string;
  score: number;
  emissions: number;
}

export interface Validator {
  id: string;
  uid: number;
  hotkey: string;
  stake: number;
  emissions: number;
  rank: number;
  status: EntityStatus;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface Miner {
  id: string;
  uid: number;
  hotkey: string;
  score: number;
  rank: number;
  emissions: number;
  status: EntityStatus;
  metadata: Record<string, unknown>;
  performanceHistory: PerformancePoint[];
  createdAt: string;
  updatedAt: string;
}

export interface MinerDetails extends Miner {
  activityHistory: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  entityType: ActivityEntityType;
  entityId?: string;
  createdAt: string;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  user: UserPublic;
}

export interface DashboardStats {
  totalValidators: number;
  activeValidators: number;
  totalMiners: number;
  averageMinerScore: number;
  totalEmissions: number;
  currentValidatorRank: number;
  minerPerformanceHistory: PerformancePoint[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export const DEMO_NOTICE =
  'Local SN58-inspired simulation. Values are fictional demo data and are not connected to the Bittensor network.';
