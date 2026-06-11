import sql from "@/db/postgres";
import { hashPassword, verifyPassword } from "@/utils/hash";
import { User, UserRole } from "@/utils/types";

export class Pengguna {
  id: string;
  name: string;
  email: string;
  telp: string;
  role: UserRole;
  is_active: boolean;
  verified_at: Date | null;
  created_at: Date;

  constructor(data: User) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.telp = data.telp;
    this.role = data.role;
    this.is_active = data.is_active;
    this.verified_at = data.verified_at;
    this.created_at = data.created_at;
  }

  static async findByEmail(email: string): Promise<Pengguna | null> {
    const rows = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    if (rows.length === 0) return null;
    return new Pengguna(rows[0] as User);
  }

  static async findById(id: string): Promise<Pengguna | null> {
    const rows = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    if (rows.length === 0) return null;
    return new Pengguna(rows[0] as User);
  }

  static async create(data: {
    name: string;
    email: string;
    telp: string;
    password: string;
  }): Promise<Pengguna> {
    const id = crypto.randomUUID();
    const password_hash = await hashPassword(data.password);

    const rows = await sql`
      INSERT INTO users (id, name, email, telp, password_hash, role, is_active, created_at)
      VALUES (
        ${id},
        ${data.name},
        ${data.email},
        ${data.telp},
        ${password_hash},
        'user',
        true,
        NOW()
      )
      RETURNING *
    `;
    return new Pengguna(rows[0] as User);
  }

  static async updateProfile(
    id: string,
    data: { name: string; telp: string }
  ): Promise<Pengguna | null> {
    const rows = await sql`
      UPDATE users
      SET name = ${data.name},
          telp = ${data.telp}
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return null;
    return new Pengguna(rows[0] as User);
  }

  static async updateRole(id: string, role: UserRole): Promise<void> {
    await sql`
      UPDATE users SET role = ${role} WHERE id = ${id}
    `;
  }

  async autentikasi(password: string): Promise<boolean> {
    const rows = await sql`
      SELECT password_hash FROM users WHERE id = ${this.id}
    `;
    if (rows.length === 0) return false;
    return await verifyPassword(password, rows[0].password_hash);
  }

  async updatePassword(newPassword: string): Promise<void> {
    const password_hash = await hashPassword(newPassword);
    await sql`
      UPDATE users SET password_hash = ${password_hash} WHERE id = ${this.id}
    `;
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  getProfil(): Omit<User, "verified_at"> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      telp: this.telp,
      role: this.role,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
