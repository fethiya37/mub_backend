export abstract class ApplicantQualificationRepository {
  abstract add(applicantId: string, input: { qualificationType: string; institution?: string | null; country?: string | null; yearCompleted?: number | null }): Promise<any>;
  abstract update(id: string, input: { institution?: string | null; country?: string | null; yearCompleted?: number | null }): Promise<any>;
  abstract remove(id: string): Promise<void>;
}
