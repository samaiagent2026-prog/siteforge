import fs from 'fs';
import path from 'path';
import { createDefaultSettings, createDefaultSite } from './defaults';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SITES_FILE = path.join(DATA_DIR, 'sites.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const DEPLOYS_FILE = path.join(DATA_DIR, 'deploys.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  try {
    ensureDir();
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir();
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

export function getSettings() {
  const stored = readJson(SETTINGS_FILE, null);
  const base = createDefaultSettings();
  if (!stored) {
    writeJson(SETTINGS_FILE, base);
    return base;
  }
  return {
    ...base,
    ...stored,
    affiliates: { ...base.affiliates, ...(stored.affiliates || {}) },
  };
}

export function saveSettings(patch) {
  const current = getSettings();
  const next = {
    ...current,
    ...patch,
    affiliates: { ...current.affiliates, ...(patch.affiliates || {}) },
  };
  writeJson(SETTINGS_FILE, next);
  return next;
}

export function getSites() {
  return readJson(SITES_FILE, {});
}

export function getSite(id) {
  const sites = getSites();
  return sites[id] || null;
}

export function saveSite(site) {
  const sites = getSites();
  const id = site.id || 'default';
  sites[id] = { ...site, id, updatedAt: new Date().toISOString() };
  writeJson(SITES_FILE, sites);
  return sites[id];
}

export function getOrCreateSite(id = 'default') {
  const existing = getSite(id);
  if (existing) return existing;
  const fresh = { id, ...createDefaultSite('My Website') };
  saveSite(fresh);
  return fresh;
}

export function getOrders() {
  return readJson(ORDERS_FILE, []);
}

export function addOrder(order) {
  const orders = getOrders();
  const record = { id: `ord_${Date.now().toString(36)}`, ...order, createdAt: new Date().toISOString() };
  orders.push(record);
  writeJson(ORDERS_FILE, orders);
  return record;
}

export function getDeploys() {
  return readJson(DEPLOYS_FILE, []);
}

export function addDeploy(entry) {
  const deploys = getDeploys();
  const record = { id: `dep_${Date.now().toString(36)}`, ...entry, createdAt: new Date().toISOString() };
  deploys.push(record);
  writeJson(DEPLOYS_FILE, deploys);
  return record;
}

export function isPaid(orderRef) {
  if (!orderRef) return false;
  return getOrders().some((o) => o.reference === orderRef && o.status === 'paid');
}
