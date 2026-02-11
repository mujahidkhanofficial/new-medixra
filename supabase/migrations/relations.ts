import { relations } from "drizzle-orm/relations";
import { profiles, vendors, products, productImages, savedItems } from "./schema";

export const vendorsRelations = relations(vendors, ({one}) => ({
	profile: one(profiles, {
		fields: [vendors.id],
		references: [profiles.id]
	}),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	vendors: many(vendors),
	savedItems: many(savedItems),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	productImages: many(productImages),
	savedItems: many(savedItems),
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