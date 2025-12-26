export abstract class RoleRepository {
  abstract findByName(name: string): Promise<{ id: string; name: string } | null>;
  abstract list(): Promise<{ id: string; name: string; description: string | null }[]>;
}
