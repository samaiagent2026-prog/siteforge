import { NextResponse } from 'next/server';
import { getOrCreateSite, saveSite } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || 'default';
  return NextResponse.json({ site: getOrCreateSite(id) });
}

export async function PUT(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const site = body && body.site ? body.site : body;
  if (!site || typeof site !== 'object' || !Array.isArray(site.elements)) {
    return NextResponse.json({ error: 'A site document with an elements array is required' }, { status: 400 });
  }
  const saved = saveSite(site);
  return NextResponse.json({ ok: true, site: saved });
}
