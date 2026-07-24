import sql from "@/db/postgres";
import { hashToken } from "@/utils/hash";
import { getExpiryDate } from "@/utils/jwt";
import { DeviceSession } from "@/utils/types";

const MAX_SESSIONS = 2;

export class deviceSession {
  id: string;
  user_id: string;
  device: string;
  token: string;
  is_active: boolean;
  created_at: Date;
  expires_at: Date;

  constructor(data: DeviceSession) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.device = data.device;
    this.token = data.token;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.expires_at = data.expires_at;
  }

  static async hitungSesiAktif(userId: string): Promise<number> {
    const rows = await sql`
      SELECT COUNT(*) as count
      FROM device_sessions
      WHERE user_id = ${userId}
        AND is_active = true
        AND expires_at > NOW()
    `;
    return parseInt(rows[0].count);
  }

  static async adaSesiBaru(userId: string, withinSeconds: number = 10): Promise<boolean> {
    const rows = await sql`
      SELECT 1
      FROM device_sessions
      WHERE user_id = ${userId}
        AND is_active = true
        AND expires_at > NOW()
        AND created_at > NOW() - (${withinSeconds} || ' seconds')::interval
      LIMIT 1
    `;
    return rows.length > 0;
  }

  static async buatSesiBaru(data: {
    userId: string;
    token: string;
    device: string;
    sessionId?: string;
  }): Promise<deviceSession> {
    const id = data.sessionId ?? crypto.randomUUID();
    const token_hash = hashToken(data.token);
    const expires_at = getExpiryDate();

    const rows = await sql`
      INSERT INTO device_sessions (
        id, user_id, device, token, is_active, created_at, expires_at
      )
      VALUES (
        ${id},
        ${data.userId},
        ${data.device},
        ${token_hash},
        true,
        NOW(),
        ${expires_at}
      )
      RETURNING *
    `;
    return new deviceSession(rows[0] as DeviceSession);
  }

  static async findByToken(token: string): Promise<deviceSession | null> {
    const token_hash = hashToken(token);
    const rows = await sql`
      SELECT * FROM device_sessions
      WHERE token = ${token_hash}
        AND is_active = true
        AND expires_at > NOW()
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return new deviceSession(rows[0] as DeviceSession);
  }

  static async getByUserId(userId: string): Promise<deviceSession[]> {
    const rows = await sql`
      SELECT * FROM device_sessions
      WHERE user_id = ${userId}
        AND is_active = true
        AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
    return rows.map((row) => new deviceSession(row as DeviceSession));
  }

  static async hapusSesiById(id: string): Promise<void> {
    await sql`
      UPDATE device_sessions
      SET is_active = false
      WHERE id = ${id}
    `;
  }

  static async hapusSemua(userId: string): Promise<void> {
    await sql`
      UPDATE device_sessions
      SET is_active = false
      WHERE user_id = ${userId}
    `;
  }

  static isMaksimum(count: number): boolean {
    return count >= MAX_SESSIONS;
  }

  async hapusSesi(): Promise<void> {
    await sql`
      UPDATE device_sessions
      SET is_active = false
      WHERE id = ${this.id}
    `;
  }
  static async hapusSessionTerlama(userId: string): Promise<void> {
  await sql`
    UPDATE device_sessions
    SET is_active = false
    WHERE id = (
      SELECT id FROM device_sessions
      WHERE user_id = ${userId}
        AND is_active = true
        AND expires_at > NOW()
      ORDER BY created_at ASC
      LIMIT 1
    )
  `;
    }
}