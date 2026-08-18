import { Prisma } from "@prisma/client";
import { getAdminDb } from "./firebase-admin";
import { prisma } from "./prisma";

/**
 * Sinkronisasi data lokal (SQLite) ⇄ Firebase Realtime Database.
 *
 * - Push: setiap perubahan di server action langsung ditulis ke Firebase
 *   (jalankan fire-and-forget lewat `fire()`).
 * - syncAll: kirim seluruh data lokal ke Firebase (backup penuh).
 * - pullAll: ambil data dari Firebase dan tambahkan record yang belum ada
 *   di lokal (restore) — tidak menimpa data lokal yang sudah ada.
 *
 * Semua fungsi no-op jika Firebase belum dikonfigurasi.
 */

export type SyncResult =
  | { ok: true; counts: Record<string, number>; skipped: Record<string, number> }
  | { ok: false; error: string };

export function fire(p: Promise<unknown>) {
  p.catch((e) => console.error("[sync]", e));
}

/** Konversi Date -> ISO string agar bisa disimpan di Firebase. */
function toJSON<T extends object>(record: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

/** Konversi balik field tanggal dari string ISO -> Date. */
function fromJSONDates(record: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  for (const f of fields) {
    const v = record[f];
    if (typeof v === "string") record[f] = new Date(v);
  }
  return record;
}

// ---------- Push satu record ----------

export async function syncUser(user: { id: string } & Record<string, unknown>) {
  const db = getAdminDb();
  if (!db) return;
  await db.ref(`users/${user.id}`).set(toJSON(user));
}

export async function syncArticle(article: { id: string } & Record<string, unknown>) {
  const db = getAdminDb();
  if (!db) return;
  await db.ref(`articles/${article.id}`).set(toJSON(article));
}

export async function syncTransaction(txn: { id: string } & Record<string, unknown>) {
  const db = getAdminDb();
  if (!db) return;
  await db.ref(`transactions/${txn.id}`).set(toJSON(txn));
}

export async function syncCategory(cat: { id: string } & Record<string, unknown>) {
  const db = getAdminDb();
  if (!db) return;
  await db.ref(`categories/${cat.id}`).set(toJSON(cat));
}

export async function syncMember(member: { id: string } & Record<string, unknown>) {
  const db = getAdminDb();
  if (!db) return;
  await db.ref(`orgMembers/${member.id}`).set(toJSON(member));
}

export async function syncSetting(key: string, value: string) {
  const db = getAdminDb();
  if (!db) return;
  await db.ref(`settings/${key}`).set({ key, value, updatedAt: new Date().toISOString() });
}

export async function deleteFromFirebase(collection: string, id: string) {
  const db = getAdminDb();
  if (!db) return;
  await db.ref(`${collection}/${id}`).remove();
}

// ---------- Backup penuh (push semua data lokal) ----------

export async function syncAll(): Promise<SyncResult> {
  const db = getAdminDb();
  if (!db) return { ok: false, error: "Firebase belum dikonfigurasi di file .env" };

  const [users, articles, txns, cats, members, settings] = await Promise.all([
    prisma.user.findMany(),
    prisma.article.findMany(),
    prisma.transaction.findMany(),
    prisma.financeCategory.findMany(),
    prisma.orgMember.findMany(),
    prisma.setting.findMany(),
  ]);

  await Promise.all([
    ...users.map((u) => db.ref(`users/${u.id}`).set(toJSON(u))),
    ...articles.map((a) => db.ref(`articles/${a.id}`).set(toJSON(a))),
    ...txns.map((t) => db.ref(`transactions/${t.id}`).set(toJSON(t))),
    ...cats.map((c) => db.ref(`categories/${c.id}`).set(toJSON(c))),
    ...members.map((m) => db.ref(`orgMembers/${m.id}`).set(toJSON(m))),
    ...settings.map((s) => db.ref(`settings/${s.key}`).set({ key: s.key, value: s.value, updatedAt: new Date().toISOString() })),
  ]);

  return {
    ok: true,
    counts: {
      users: users.length,
      articles: articles.length,
      transactions: txns.length,
      categories: cats.length,
      orgMembers: members.length,
      settings: settings.length,
    },
    skipped: {},
  };
}

// ---------- Restore (tarik dari Firebase, tambahkan yang belum ada) ----------

const USER_DATE_FIELDS = ["dateOfBirth", "createdAt", "updatedAt"];
const ARTICLE_DATE_FIELDS = ["createdAt", "updatedAt"];
const TXN_DATE_FIELDS = ["date", "createdAt"];

export async function pullAll(): Promise<SyncResult> {
  const db = getAdminDb();
  if (!db) return { ok: false, error: "Firebase belum dikonfigurasi di file .env" };

  const counts: Record<string, number> = {};
  const skipped: Record<string, number> = {};

  // 1. Users (butuh dulu untuk relasi author/createdBy)
  const usersSnap = await db.ref("users").once("value");
  const remoteUsers = (usersSnap.val() as Record<string, Record<string, unknown>>) || {};
  const localUserIds = new Set((await prisma.user.findMany({ select: { id: true } })).map((u) => u.id));
  let createdUsers = 0;
  for (const [id, data] of Object.entries(remoteUsers)) {
    if (localUserIds.has(id)) {
      skipped.users = (skipped.users || 0) + 1;
      continue;
    }
    const rec = fromJSONDates({ ...data }, USER_DATE_FIELDS) as Prisma.UserCreateInput;
    await prisma.user.create({ data: rec });
    createdUsers++;
  }
  counts.users = createdUsers;

  // 2. Categories
  const catsSnap = await db.ref("categories").once("value");
  const remoteCats = (catsSnap.val() as Record<string, Record<string, unknown>>) || {};
  const localCatIds = new Set((await prisma.financeCategory.findMany({ select: { id: true } })).map((c) => c.id));
  let createdCats = 0;
  for (const [id, data] of Object.entries(remoteCats)) {
    if (localCatIds.has(id)) {
      skipped.categories = (skipped.categories || 0) + 1;
      continue;
    }
    await prisma.financeCategory.create({ data: { ...data } as Prisma.FinanceCategoryCreateInput });
    createdCats++;
  }
  counts.categories = createdCats;

  // 3. OrgMembers
  const membersSnap = await db.ref("orgMembers").once("value");
  const remoteMembers = (membersSnap.val() as Record<string, Record<string, unknown>>) || {};
  const localMemberIds = new Set((await prisma.orgMember.findMany({ select: { id: true } })).map((m) => m.id));
  let createdMembers = 0;
  for (const [id, data] of Object.entries(remoteMembers)) {
    if (localMemberIds.has(id)) {
      skipped.orgMembers = (skipped.orgMembers || 0) + 1;
      continue;
    }
    await prisma.orgMember.create({ data: { ...data } as Prisma.OrgMemberCreateInput });
    createdMembers++;
  }
  counts.orgMembers = createdMembers;

  // 4. Articles (butuh author yang ada di lokal)
  const articlesSnap = await db.ref("articles").once("value");
  const remoteArticles = (articlesSnap.val() as Record<string, Record<string, unknown>>) || {};
  const localArticleIds = new Set((await prisma.article.findMany({ select: { id: true } })).map((a) => a.id));
  let createdArticles = 0;
  for (const [id, data] of Object.entries(remoteArticles)) {
    if (localArticleIds.has(id)) {
      skipped.articles = (skipped.articles || 0) + 1;
      continue;
    }
    if (!localUserIds.has(String(data.authorId))) {
      skipped.articles = (skipped.articles || 0) + 1;
      continue;
    }
    const rec = fromJSONDates({ ...data }, ARTICLE_DATE_FIELDS) as Prisma.ArticleCreateInput;
    await prisma.article.create({ data: rec });
    createdArticles++;
  }
  counts.articles = createdArticles;

  // 5. Transactions (butuh kategori + createdBy yang ada di lokal)
  const txnsSnap = await db.ref("transactions").once("value");
  const remoteTxns = (txnsSnap.val() as Record<string, Record<string, unknown>>) || {};
  const localTxnIds = new Set((await prisma.transaction.findMany({ select: { id: true } })).map((t) => t.id));
  let createdTxns = 0;
  for (const [id, data] of Object.entries(remoteTxns)) {
    if (localTxnIds.has(id)) {
      skipped.transactions = (skipped.transactions || 0) + 1;
      continue;
    }
    if (!localCatIds.has(String(data.categoryId)) || !localUserIds.has(String(data.createdById))) {
      skipped.transactions = (skipped.transactions || 0) + 1;
      continue;
    }
    const rec = fromJSONDates({ ...data }, TXN_DATE_FIELDS) as Prisma.TransactionCreateInput;
    await prisma.transaction.create({ data: rec });
    createdTxns++;
  }
  counts.transactions = createdTxns;

  // 6. Settings (hanya tambahkan key yang belum ada)
  const settingsSnap = await db.ref("settings").once("value");
  const remoteSettings = (settingsSnap.val() as Record<string, Record<string, unknown>>) || {};
  const localSettingKeys = new Set((await prisma.setting.findMany({ select: { key: true } })).map((s) => s.key));
  let createdSettings = 0;
  for (const [key, data] of Object.entries(remoteSettings)) {
    if (localSettingKeys.has(key)) {
      skipped.settings = (skipped.settings || 0) + 1;
      continue;
    }
    await prisma.setting.create({ data: { key, value: String(data.value ?? "") } });
    createdSettings++;
  }
  counts.settings = createdSettings;

  return { ok: true, counts, skipped };
}

// ---------- Status ----------

export function firebaseStatus(): { configured: boolean; databaseURL: string } {
  return {
    configured: Boolean(getAdminDb()),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "",
  };
}
