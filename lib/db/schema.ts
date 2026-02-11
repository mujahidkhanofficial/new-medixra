
import { pgTable, pgPolicy, uuid, text, timestamp, foreignKey, unique, boolean, numeric, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { relations } from "drizzle-orm/relations";

// --- Introspected Tables ---

export const profiles = pgTable("profiles", {
    id: uuid().primaryKey().notNull(),
    email: text().notNull(),
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),
    phone: text(),
    city: text(),
    role: text().default('buyer'),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    pgPolicy("Public Profiles", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
    pgPolicy("Users can insert own profile", { as: "permissive", for: "insert", to: ["public"] }),
    pgPolicy("Users can update own profile", { as: "permissive", for: "update", to: ["public"] }),
]);

export const vendors = pgTable("vendors", {
    id: uuid().primaryKey().notNull(),
    businessName: text("business_name").notNull(),
    description: text(),
    isVerified: boolean("is_verified").default(false),
    contactPhone: text("contact_phone"),
    whatsappNumber: text("whatsapp_number"),
    city: text(),
    showroomSlug: text("showroom_slug"),
    bannerUrl: text("banner_url"),
    isFeatured: boolean("is_featured").default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.id],
        foreignColumns: [profiles.id],
        name: "vendors_id_profiles_id_fk"
    }).onDelete("cascade"),
    unique("vendors_showroom_slug_unique").on(table.showroomSlug),
    pgPolicy("Public Vendors", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
    pgPolicy("Vendors can insert own business", { as: "permissive", for: "insert", to: ["public"] }),
    pgPolicy("Vendors can update own business", { as: "permissive", for: "update", to: ["public"] }),
]);

export const products = pgTable("products", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    vendorId: uuid("vendor_id").notNull(),
    name: text().notNull(),
    description: text(),
    category: text().notNull(),
    price: numeric().notNull(),
    condition: text(),
    brand: text(),
    warranty: text(),
    speciality: text(),
    imageUrl: text("image_url"),
    location: text(),
    city: text(),
    area: text(),
    status: text().default('active'),
    views: integer().default(0),
    whatsappClicks: integer("whatsapp_clicks").default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    pgPolicy("Public Active Products", { as: "permissive", for: "select", to: ["public"], using: sql`((status = 'active'::text) OR (auth.uid() = vendor_id))` }),
    pgPolicy("Vendors can insert products", { as: "permissive", for: "insert", to: ["public"] }),
    pgPolicy("Vendors can update own products", { as: "permissive", for: "update", to: ["public"] }),
    pgPolicy("Vendors can delete own products", { as: "permissive", for: "delete", to: ["public"] }),
    foreignKey({
        columns: [table.vendorId],
        foreignColumns: [profiles.id],
        name: "products_vendor_id_fkey"
    }).onDelete("cascade"),
]);

export const productImages = pgTable("product_images", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: uuid("product_id").notNull(),
    url: text().notNull(),
    displayOrder: integer("display_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
        name: "product_images_product_id_products_id_fk"
    }).onDelete("cascade"),
    pgPolicy("Public Images", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
    pgPolicy("Authenticated insert images", { as: "permissive", for: "insert", to: ["public"] }),
    pgPolicy("Users can update own images", { as: "permissive", for: "update", to: ["public"] }),
    pgPolicy("Users can delete own images", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const users = pgTable("users", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    name: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    unique("users_email_unique").on(table.email),
]);

export const savedItems = pgTable("saved_items", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    productId: uuid("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
        name: "saved_items_product_id_fkey"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [profiles.id],
        name: "saved_items_user_id_fkey"
    }).onDelete("cascade"),
]);

// --- Relations ---

export const vendorsRelations = relations(vendors, ({ one }) => ({
    profile: one(profiles, {
        fields: [vendors.id],
        references: [profiles.id]
    }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
    vendors: many(vendors),
    savedItems: many(savedItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id]
    }),
}));

export const productsRelations = relations(products, ({ many }) => ({
    productImages: many(productImages),
    savedItems: many(savedItems),
}));

export const savedItemsRelations = relations(savedItems, ({ one }) => ({
    product: one(products, {
        fields: [savedItems.productId],
        references: [products.id]
    }),
    profile: one(profiles, {
        fields: [savedItems.userId],
        references: [profiles.id]
    }),
}));

// --- Test Table ---

export const usersTestDrizzle = pgTable('users_test_drizzle', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name'),
    email: text('email').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
