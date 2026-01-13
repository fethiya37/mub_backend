export type CvTemplateCreate = {
  name: string;
  description?: string | null;
  htmlTemplate: string;
  cssStyle?: string | null;
  isActive: boolean;
  createdBy?: string | null;
};

export abstract class CvTemplateRepository {
  abstract create(input: CvTemplateCreate): Promise<any>;
  abstract update(id: string, patch: Partial<CvTemplateCreate>): Promise<any>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<any | null>;
  abstract listActive(): Promise<any[]>;
  abstract findDefaultActive(): Promise<any | null>;
}
