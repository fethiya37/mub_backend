export type VisaComplianceCreate = {
  visaApplicationId: string;
  requirementType: string;
  remarks?: string | null;
  createdByAdminId?: string | null;
};

export type VisaComplianceUpdate = {
  requirementStatus: string;
  remarks?: string | null;
  checkedByAdminId?: string | null;
  checkedAt?: Date | null;
};

export abstract class VisaComplianceRepository {
  abstract add(input: VisaComplianceCreate): Promise<any>;
  abstract findById(id: string): Promise<any | null>;
  abstract listByVisa(visaApplicationId: string): Promise<any[]>;
  abstract update(id: string, patch: VisaComplianceUpdate): Promise<any>;
  abstract hasBlockingFailures(visaApplicationId: string): Promise<boolean>;
}
