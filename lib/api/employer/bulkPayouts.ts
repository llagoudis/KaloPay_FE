import { apiClient } from "@/lib/api/client";

export type BulkPayoutItem = {
  slNo: number;
  asset: string;
  address: string;
  amount: number | null;
  status: string;
};

export type BulkPayoutBatch = {
  id: number;
  fileName: string;
  currency: string;
  status: string;
  totalCount: number;
  completedCount: number;
  uploadTime: string;
  items: BulkPayoutItem[];
};

export const bulkPayoutsApi = {
  list: (token: string) =>
    apiClient<{ batches: BulkPayoutBatch[] }>(`/employer/bulk-payouts`, { token }),
};
