export abstract class ApplicantSkillRepository {
  abstract add(applicantId: string, input: { skillName: string; proficiencyLevel?: string | null; yearsOfExperience?: number | null }): Promise<any>;
  abstract update(id: string, input: { proficiencyLevel?: string | null; yearsOfExperience?: number | null }): Promise<any>;
  abstract remove(id: string): Promise<void>;
}