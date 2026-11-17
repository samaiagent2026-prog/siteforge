import { NextResponse } from 'next/server';
import { createToken, usingDefaultPassword, verifyPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!verifyPassword(body && body.password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }
  return NextResponse.json({
    token: createToken(),
    usingDefaultPassword: usingDefaultPassword(),
  });
}
