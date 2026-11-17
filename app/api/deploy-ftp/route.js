import { NextResponse } from 'next/server';
import { Client } from 'basic-ftp';
import { Readable } from 'stream';
import { addDeploy, getSite, isPaid } from '@/lib/store';
import { compileSite } from '@/lib/compile';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const HOST_RE = /^[a-z0-9.-]+$/i;

/**
 * Accepts "ftp.mybusiness.com", "ftp://host:21/", "1.2.3.4:2121" and returns
 * { host, port } so non-standard FTP ports (some hosts use 21xx) still work.
 */
function parseHost(raw) {
  let value = String(raw || '')
    .trim()
    .replace(/^ftps?:\/\//i, '')
    .replace(/\/.*$/, '');
  let port = 21;
  const match = value.match(/:(\d+)$/);
  if (match) {
    port = Number(match[1]);
    value = value.slice(0, -match[0].length);
  }
  return { host: value, port };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const domain = String(body.domain || '').trim();
  const { host, port } = parseHost(body.host);
  const user = String(body.user || '').trim();
  const password = String(body.password || '');
  const orderRef = String(body.reference || '').trim();
  const siteId = String(body.siteId || 'default');
  const remoteDir = String(body.remoteDir || 'public_html').trim() || 'public_html';

  const missing = [];
  if (!domain) missing.push('domain');
  if (!host) missing.push('host');
  if (!user) missing.push('user');
  if (!password) missing.push('password');
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    );
  }
  if (!HOST_RE.test(host)) {
    return NextResponse.json({ error: 'FTP host looks invalid' }, { status: 400 });
  }

  // Guard the paid step: activation must be settled before we publish.
  if (!isPaid(orderRef)) {
    return NextResponse.json(
      { error: 'Activation payment not found. Please complete the activation fee first.' },
      { status: 402 }
    );
  }

  const site = getSite(siteId);
  if (!site) {
    return NextResponse.json({ error: 'No website found to deploy' }, { status: 404 });
  }

  const files = compileSite(site);
  const client = new Client();
  client.ftp.verbose = false;

  const log = [];
  const record = (msg) => {
    log.push(msg);
  };

  try {
    client.ftp.socket?.setTimeout?.(30000);
    await client.access({
      host,
      port,
      user,
      password,
      secure: false,
    });
    record(`Connected to ${host}:${port}`);

    try {
      await client.ensureDir(remoteDir);
      record(`Opened ${remoteDir}`);
    } catch {
      record(`Could not open ${remoteDir}; uploading to the account root instead`);
      await client.cd('/');
    }

    for (const [name, contents] of Object.entries(files)) {
      const buffer = Buffer.from(contents, 'utf8');
      await client.uploadFrom(Readable.from(buffer), name);
      record(`Uploaded ${name} (${buffer.length} bytes)`);
    }

    client.close();
    record('Closed connection');

    const url = `http://${domain.replace(/^https?:\/\//i, '').replace(/\/$/, '')}`;
    const deploy = addDeploy({
      domain,
      host,
      port,
      user,
      reference: orderRef,
      siteId,
      status: 'success',
      log,
      url,
    });

    return NextResponse.json({ ok: true, url, deploy: { ...deploy, password: undefined } });
  } catch (err) {
    try {
      client.close();
    } catch {
      /* ignore */
    }
    const message = err && err.message ? err.message : 'Unknown FTP error';
    record(`Failed: ${message}`);
    addDeploy({
      domain,
      host,
      port,
      user,
      reference: orderRef,
      siteId,
      status: 'failed',
      log,
      error: message,
    });
    return NextResponse.json(
      {
        error: `Could not publish to your host: ${message}`,
        hint: 'Double-check the FTP host, username and password from your hosting welcome email.',
        log,
      },
      { status: 502 }
    );
  }
}
