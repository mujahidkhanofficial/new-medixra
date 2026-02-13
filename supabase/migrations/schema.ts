import { pgTable, index, foreignKey, pgPolicy, uuid, text, integer, timestamp, numeric, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const productImages = pgTable("product_images", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	url: text().notNull(),
	displayOrder: integer("display_order").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("product_images_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
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
	// TODO: failed to parse database type 'tsvector' — declared as text for TypeScript
	searchVector: text("search_vector").generatedAlwaysAs(sql`to_tsvector('english'::regconfig, ((((name || ' '::text) || COALESCE(description, ''::text)) || ' '::text) || COALESCE(brand, ''::text)))`),
}, (table) => [
	index("products_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("products_city_idx").using("btree", table.city.asc().nullsLast().op("text_ops")),
	index("products_price_idx").using("btree", table.price.asc().nullsLast().op("numeric_ops")),
	index("products_search_idx").using("gin", table.searchVector.asc().nullsLast().op("tsvector_ops")),
	index("products_vendor_idx").using("btree", table.vendorId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.vendorId],
			foreignColumns: [profiles.id],
			name: "products_vendor_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Public Active Products", { as: "permissive", for: "select", to: ["public"], using: sql`((status = 'active'::text) OR (auth.uid() = vendor_id))` }),
	pgPolicy("Vendors can insert products", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Vendors can update own products", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Vendors can delete own products", { as: "permissive", for: "delete", to: ["public"] }),
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

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	email: text().notNull(),
	fullName: text("full_name"),
	avatarUrl: text("avatar_url"),
	phone: text(),
	city: text(),
	role: text().default('user'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	approvalStatus: text("approval_status").default('approved'),
}, (table) => [
	pgPolicy("Public Profiles", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("Users can insert own profile", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can update own profile", { as: "permissive", for: "update", to: ["public"] }),
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
	pgPolicy("Public Technicians", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Technicians can insert own profile", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Technicians can update own profile", { as: "permissive", for: "update", to: ["public"] }),
]);

export const savedItems = pgTable("saved_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("saved_items_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
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
