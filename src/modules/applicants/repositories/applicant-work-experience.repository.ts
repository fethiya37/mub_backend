export abstract class ApplicantWorkExperienceRepository {
  abstract add(applicantId: string, input: { jobTitle: string; employerName?: string | null; country?: string | null; startDate?: Date | null; endDate?: Date | null; responsibilities?: string | null }): Promise<any>;
  abstract update(id: string, input: { employerName?: string | null; country?: string | null; startDate?: Date | null; endDate?: Date | null; responsibilities?: string | null }): Promise<any>;
  abstract remove(id: string): Promise<void>;
}
