import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getDeploys, getOrders, getSettings, getSites } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const orders = getOrders();
  const deploys = getDeploys();
  const sites = getSites();
  const paid = orders.filter((o) => o.status === 'paid');
  const revenue = paid.reduce((sum, o) => sum + Number(o.amount || 0), 0);

  return NextResponse.json({
    stats: {
      revenue,
      currency: getSettings().currency,
      paidOrders: paid.length,
      pendingOrders: orders.length - paid.length,
      deploys: deploys.length,
      successfulDeploys: deploys.filter((d) => d.status === 'success').length,
      sites: Object.keys(sites).length,
    },
    orders: orders.slice().reverse().slice(0, 50),
    deploys: deploys
      .slice()
      .reverse()
      .slice(0, 50)
      .map((d) => ({ ...d, password: undefined })),
  });
}
