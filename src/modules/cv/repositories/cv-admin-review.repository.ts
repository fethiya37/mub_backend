export type CvAdminReviewCreate = {
  cvId: string;
  adminId: string;
  status: string;
  comments?: string | null;
};

export abstract class CvAdminReviewRepository {
  abstract create(input: CvAdminReviewCreate): Promise<any>;
  abstract listByCv(cvId: string): Promise<any[]>;
}
