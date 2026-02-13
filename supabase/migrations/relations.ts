import { relations } from "drizzle-orm/relations";
import { products, productImages, profiles, vendors, technicians, savedItems } from "./schema";

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productImages: many(productImages),
	profile: one(profiles, {
		fields: [products.vendorId],
		references: [profiles.id]
	}),
	savedItems: many(savedItems),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	products: many(products),
	vendors: many(vendors),
	technicians: many(technicians),
	savedItems: many(savedItems),
}));

export const vendorsRelations = relations(vendors, ({one}) => ({
	profile: one(profiles, {
		fields: [vendors.id],
		references: [profiles.id]
	}),
}));

export const techniciansRelations = relations(technicians, ({one}) => ({
	profile: one(profiles, {
		fields: [technicians.id],
		references: [profiles.id]
	}),
}));

export const savedItemsRelations = relations(savedItems, ({one}) => ({
	product: one(products, {
		fields: [savedItems.productId],
		references: [products.id]
	}),
	profile: one(profiles, {
		fields: [savedItems.userId],
		references: [profiles.id]
	}),
}));