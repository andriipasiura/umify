import { sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

const id = () =>
  text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const dateTime = () => timestamp({ precision: 3, mode: 'date' });

export const users = pgTable('User', {
  id: id(),
  name: text(),
  email: text().unique('User_email_key'),
  emailVerified: dateTime(),
  image: text(),
});

export const accounts = pgTable(
  'Account',
  {
    userId: text().notNull(),
    type: text().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: text(),
    scope: text(),
    id_token: text(),
    session_state: text(),
  },
  (table) => [
    primaryKey({ name: 'Account_pkey', columns: [table.provider, table.providerAccountId] }),
    foreignKey({
      name: 'Account_userId_fkey',
      columns: [table.userId],
      foreignColumns: [users.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  ],
);

export const visibility = pgEnum('Visibility', ['public', 'private']);
export type Visibility = (typeof visibility.enumValues)[number];

export const diagrams = pgTable(
  'Diagram',
  {
    id: id(),
    title: text().notNull(),
    ownerId: text().notNull(),
    version: integer().notNull().default(1),
    visibility: visibility().notNull().default('private'),
    category: text(),
    tags: text()
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    isFavorite: boolean().notNull().default(false),
    nodes: jsonb().notNull(),
    edges: jsonb().notNull(),
    thumbnailLight: text(),
    thumbnailDark: text(),
    createdAt: dateTime()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: dateTime()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: 'Diagram_ownerId_fkey',
      columns: [table.ownerId],
      foreignColumns: [users.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('Diagram_ownerId_idx').on(table.ownerId),
    index('Diagram_ownerId_visibility_idx').on(table.ownerId, table.visibility),
  ],
);
