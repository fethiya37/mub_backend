export type VisaStatusHistoryCreate = {
  visaApplicationId: string;
  previousStatus?: string | null;
  newStatus: string;
  changedByAdminId?: string | null;
  changeReason?: string | null;
};

export abstract class VisaStatusHistoryRepository {
  abstract add(input: VisaStatusHistoryCreate): Promise<void>;
  abstract listByVisa(visaApplicationId: string): Promise<any[]>;
}
