export abstract class PermissionRepository {
  abstract list(): Promise<{ id: string; code: string; description: string | null }[]>;
  abstract listByUserId(userId: string): Promise<string[]>;
}
