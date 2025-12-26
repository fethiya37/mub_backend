export abstract class UserRoleRepository {
  abstract listRolesByUserId(userId: string): Promise<string[]>;
  abstract replaceRoles(userId: string, roleNames: string[]): Promise<void>;
}
