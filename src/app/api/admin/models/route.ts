// src/app/api/admin/provider-models/route.ts

import { NextResponse } from 'next/server';
import sql from '@/db';
import { randomUUID } from 'crypto';

export async function GET() {
  const models = await sql`
    SELECT m.id, m.display_name, m.model_name, m.is_active,
           p.id as provider_id, p.provider_name
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    ORDER BY p.provider_name, m.display_name
  `;
  return NextResponse.json(models);
}

export async function POST(req: Request) {
  const { provider_id, model_name, display_name } = await req.json();

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
    INSERT INTO models (id, provider_id, display_name, model_name, is_active)
    VALUES (${randomUUID()}, ${provider_id}, ${display_name}, ${model_name}, true)
  `;

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { model_id, is_active } = await req.json();

  await sql`
    UPDATE models SET is_active = ${is_active} WHERE id = ${model_id}
  `;

  return NextResponse.json({ success: true });
}

// export async function DELETE(req: Request) {
//   const { model_id } = await req.json();

//   await sql`
//     DELETE FROM models WHERE id = ${model_id}
//   `;

//   return NextResponse.json({ success: true });
// }