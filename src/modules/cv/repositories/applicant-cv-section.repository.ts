export type CvSectionUpsert = {
  cvId: string;
  sectionName: string;
  isEnabled: boolean;
  displayOrder: number;
  customContent?: any | null;
};

export abstract class ApplicantCvSectionRepository {
  abstract replaceAll(cvId: string, sections: CvSectionUpsert[]): Promise<void>;
  abstract listByCv(cvId: string): Promise<any[]>;
}
