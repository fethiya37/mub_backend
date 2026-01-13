export type CvVersionCreate = {
  cvId: string;
  versionNumber: number;
  pdfUrl: string;
  htmlSnapshot: string;
  isFinal: boolean;
};

export abstract class ApplicantCvVersionRepository {
  abstract create(input: CvVersionCreate): Promise<any>;
  abstract listByCv(cvId: string): Promise<any[]>;
  abstract listByApplicant(applicantId: string): Promise<any[]>;
  abstract findById(id: string): Promise<any | null>;
}
