import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone", { length: 20 }),
  bio: text("bio"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 20 }),
  occupation: varchar("occupation", { length: 100 }),
  company: varchar("company", { length: 100 }),
  website: varchar("website", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 10 }),
  country: varchar("country", { length: 100 }),
  timezone: varchar("timezone", { length: 50 }),
  language: varchar("language", { length: 10 }).default("en"),
  isVerified: boolean("is_verified").default(false),
  isAgent: boolean("is_agent").default(false),
  agentLicense: varchar("agent_license", { length: 100 }),
  agentCompany: varchar("agent_company", { length: 100 }),
  agentExperience: integer("agent_experience"), // years of experience
  preferences: jsonb("preferences"), // JSON object for user preferences
  notificationSettings: jsonb("notification_settings"), // JSON object for notification settings
  privacySettings: jsonb("privacy_settings"), // JSON object for privacy settings
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }),
  propertyType: varchar("property_type", { length: 50 }).notNull(), // apartment, house, condo, townhouse
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  squareFootage: integer("square_footage"),
  yearBuilt: integer("year_built"),
  parking: boolean("parking").default(false),
  pool: boolean("pool").default(false),
  gym: boolean("gym").default(false),
  petFriendly: boolean("pet_friendly").default(false),
  furnished: boolean("furnished").default(false),
  available: boolean("available").default(true),
  featured: boolean("featured").default(false),
  ownerId: varchar("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property images table
export const propertyImages = pgTable("property_images", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings/Inquiries table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  message: text("message"),
  visitDate: timestamp("visit_date"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Favorites/Wishlist table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  notes: text("notes"), // User can add personal notes about the property
  createdAt: timestamp("created_at").defaultNow(),
});

// User search history table
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  searchQuery: text("search_query").notNull(),
  filters: jsonb("filters"), // JSON object storing search filters
  createdAt: timestamp("created_at").defaultNow(),
});

// User viewing history table
export const viewingHistory = pgTable("viewing_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
},
(table) => [
  uniqueIndex("unique_user_property").on(table.userId, table.propertyId)
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  reviews: many(reviews),
  bookings: many(bookings),
  favorites: many(favorites),
  searchHistory: many(searchHistory),
  viewingHistory: many(viewingHistory),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, { fields: [properties.ownerId], references: [users.id] }),
  images: many(propertyImages),
  reviews: many(reviews),
  bookings: many(bookings),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, { fields: [propertyImages.propertyId], references: [properties.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  property: one(properties, { fields: [reviews.propertyId], references: [properties.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  property: one(properties, { fields: [bookings.propertyId], references: [properties.id] }),
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  property: one(properties, { fields: [favorites.propertyId], references: [properties.id] }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, { fields: [searchHistory.userId], references: [users.id] }),
}));

export const viewingHistoryRelations = relations(viewingHistory, ({ one }) => ({
  user: one(users, { fields: [viewingHistory.userId], references: [users.id] }),
  property: one(properties, { fields: [viewingHistory.propertyId], references: [properties.id] }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPropertyImageSchema = createInsertSchema(propertyImages).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, updatedAt: true });
// PATCH: allow visitDate to be string or Date
export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    visitDate: z.preprocess(
      (val) => (typeof val === 'string' || val instanceof Date) && val ? new Date(val) : undefined,
      z.date().optional()
    ),
  });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({ id: true, createdAt: true });
export const insertViewingHistorySchema = createInsertSchema(viewingHistory).omit({ id: true, viewedAt: true });

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = z.infer<typeof insertPropertyImageSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type ViewingHistory = typeof viewingHistory.$inferSelect;
export type InsertViewingHistory = z.infer<typeof insertViewingHistorySchema>;

// Extended types for queries with relations
export type PropertyWithDetails = Property & {
  images: PropertyImage[];
  reviews: Review[];
  owner: User;
};

export type PropertyWithStats = Property & {
  images: PropertyImage[];
  averageRating: number;
  reviewCount: number;
  primaryImage?: PropertyImage;
};

export type UserWithDetails = User & {
  favorites: Favorite[];
  searchHistory: SearchHistory[];
  viewingHistory: ViewingHistory[];
  properties: Property[];
  reviews: Review[];
  bookings: Booking[];
};

export type FavoriteWithProperty = Favorite & {
  property: PropertyWithStats;
};

export type ViewingHistoryWithProperty = ViewingHistory & {
  property: PropertyWithStats;
};
