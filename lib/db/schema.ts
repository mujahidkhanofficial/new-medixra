
import { pgTable, pgPolicy, uuid, text, timestamp, foreignKey, unique, boolean, numeric, integer, customType, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { relations } from "drizzle-orm/relations";

const tsvector = customType<{ data: string }>({
    dataType: () => "tsvector",
});

// --- Introspected Tables ---

export const profiles = pgTable("profiles", {
    id: uuid().primaryKey().notNull(),
    email: text().notNull(),
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),
    phone: text(),
    city: text(),
    role: text().default('user'), // 'user', 'vendor', 'technician', 'admin'
    approvalStatus: text("approval_status").default('approved'), // 'approved', 'pending', 'rejected'
    status: text().default('active'), // 'active', 'suspended' — tracks suspension separately from role
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

export const technicians = pgTable("technicians", {
    id: uuid().primaryKey().notNull(),
    speciality: text(),
    experienceYears: text("experience_years"),
    isVerified: boolean("is_verified").default(false),
    city: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.id],
        foreignColumns: [profiles.id],
        name: "technicians_id_profiles_id_fk"
    }).onDelete("cascade"),
    pgPolicy("Public Technicians", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
    pgPolicy("Technicians can insert own profile", { as: "permissive", for: "insert", to: ["public"] }),
    pgPolicy("Technicians can update own profile", { as: "permissive", for: "update", to: ["public"] }),
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
    model: text(),
    priceType: text("price_type").default('fixed'),
    currency: text().default('PKR'),
    ceCertified: boolean("ce_certified").default(false),
    fdaApproved: boolean("fda_approved").default(false),
    isoCertified: boolean("iso_certified").default(false),
    drapRegistered: boolean("drap_registered").default(false),
    otherCertifications: text("other_certifications"),
    originCountry: text("origin_country"),
    refurbishmentCountry: text("refurbishment_country"),
    installationSupportCountry: text("installation_support_country"),
    amcAvailable: boolean("amc_available").default(false),
    sparePartsAvailable: boolean("spare_parts_available").default(false),
    installationIncluded: boolean("installation_included").default(false),
    tags: text("tags"),
    views: integer().default(0),
    whatsappClicks: integer("whatsapp_clicks").default(0),
    searchVector: tsvector("search_vector").generatedAlwaysAs(sql`to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || coalesce(brand, ''))`),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    index("products_search_idx").using("gin", table.searchVector),
    index("products_vendor_idx").on(table.vendorId),
    index("products_category_idx").on(table.category),
    index("products_price_idx").on(table.price),
    index("products_city_idx").on(table.city),
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
    index("product_images_product_idx").on(table.productId),
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

export const savedItems = pgTable("saved_items", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    productId: uuid("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    index("saved_items_user_idx").on(table.userId),
    unique("saved_items_user_product_unique").on(table.userId, table.productId),
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

export const productReports = pgTable("product_reports", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: uuid("product_id").notNull(),
    reportedBy: uuid("reported_by").notNull(),
    reason: text().notNull(), // 'suspicious_pricing', 'inappropriate_content', 'duplicate', 'counterfeit', 'outdated_info', 'other'
    description: text(),
    status: text().default('open'), // 'open', 'investigating', 'resolved', 'dismissed'
    resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: 'string' }),
    resolvedBy: uuid("resolved_by"),
    actionTaken: text("action_taken"), // 'listing_removed', 'vendor_warned', 'no_action', etc
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    index("product_reports_product_idx").on(table.productId),
    index("product_reports_status_idx").on(table.status),
    index("product_reports_created_idx").on(table.createdAt),
    foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
        name: "product_reports_product_id_fkey"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.reportedBy],
        foreignColumns: [profiles.id],
        name: "product_reports_reported_by_fkey"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.resolvedBy],
        foreignColumns: [profiles.id],
        name: "product_reports_resolved_by_fkey"
    }).onDelete("set null"),
    pgPolicy("Public can report products", { as: "permissive", for: "insert", to: ["public"] }),
    pgPolicy("Admins can view reports", { as: "permissive", for: "select", to: ["public"], using: sql`auth.jwt()->>'role' = 'admin'` }),
]);

export const notifications = pgTable("notifications", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    type: text().notNull(), // 'ad_approved', 'ad_suspended', 'ad_rejected', 'message', 'system'
    title: text().notNull(),
    message: text(),
    isRead: boolean("is_read").default(false),
    link: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_unread_idx").on(table.userId, table.isRead),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [profiles.id],
        name: "notifications_user_id_fkey"
    }).onDelete("cascade"),
    pgPolicy("Users can view own notifications", { as: "permissive", for: "select", to: ["public"], using: sql`auth.uid() = user_id` }),
    pgPolicy("Users can update own notifications", { as: "permissive", for: "update", to: ["public"], using: sql`auth.uid() = user_id` }),
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
    technicians: many(technicians),
    savedItems: many(savedItems),
    products: many(products),
    reportsCreated: many(productReports, { relationName: "reportedBy" }),
    reportsResolved: many(productReports, { relationName: "resolvedBy" }),
}));

export const techniciansRelations = relations(technicians, ({ one }) => ({
    profile: one(profiles, {
        fields: [technicians.id],
        references: [profiles.id]
    }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id]
    }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    productImages: many(productImages),
    savedItems: many(savedItems),
    reports: many(productReports),
    vendor: one(profiles, {
        fields: [products.vendorId],
        references: [profiles.id],
    }),
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

export const productReportsRelations = relations(productReports, ({ one }) => ({
    product: one(products, {
        fields: [productReports.productId],
        references: [products.id]
    }),
    reporter: one(profiles, {
        fields: [productReports.reportedBy],
        references: [profiles.id],
        relationName: "reportedBy"
    }),
    resolver: one(profiles, {
        fields: [productReports.resolvedBy],
        references: [profiles.id],
        relationName: "resolvedBy"
    }),
}));
