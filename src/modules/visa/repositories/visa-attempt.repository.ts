export type CreateVisaAttemptInput = {
  visaCaseId: string;
  attemptNumber: number;
  status: 'ISSUED' | 'REJECTED';
  applicationNumber?: string | null;
  visaNumber?: string | null;
  issuedAt?: Date | null;
  expiresAt?: Date | null;
  rejectionReason?: string | null;
  barcodeValue?: string | null;
  barcodeImageUrl?: string | null;
};

export abstract class VisaAttemptRepository {
  abstract create(input: CreateVisaAttemptInput): Promise<any>;
  abstract maxAttemptNumber(visaCaseId: string): Promise<number>;
}
