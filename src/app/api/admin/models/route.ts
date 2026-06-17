import { NextResponse } from 'next/server';
import sql from "@/db/postgres";
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const models = await sql`
      SELECT m.id, m.display_name, m.model_name, m.is_active,
             p.id as provider_id, p.provider_name
      FROM models m
      JOIN providers p ON m.provider_id = p.id
      ORDER BY p.provider_name, m.display_name
    `;
    return NextResponse.json({ success: true, data: models });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil model', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { provider_id, model_name, display_name, max_context_length } = await req.json();

    const existing = await sql`
      SELECT id FROM models
      WHERE provider_id = ${provider_id} AND model_name = ${model_name}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Model sudah ada' },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO models (id, provider_id, display_name, model_name, is_active, max_context_length)
      VALUES (${randomUUID()}, ${provider_id}, ${display_name}, ${model_name}, true, ${max_context_length ?? 4096})
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal menambah model', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { model_id, is_active, display_name, model_name } = await req.json();

    if (display_name !== undefined || model_name !== undefined) {
      await sql`
        UPDATE models
        SET
          display_name = COALESCE(${display_name}, display_name),
          model_name   = COALESCE(${model_name}, model_name),
          is_active    = COALESCE(${is_active}, is_active)
        WHERE id = ${model_id}
      `;
    } else {
      await sql`
        UPDATE models SET is_active = ${is_active} WHERE id = ${model_id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate model', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { model_id } = await req.json();
    await sql`DELETE FROM models WHERE id = ${model_id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus model', error: error.message },
      { status: 500 }
    );
  }
}