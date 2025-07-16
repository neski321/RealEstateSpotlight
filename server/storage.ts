import {
  users,
  properties,
  propertyImages,
  reviews,
  bookings,
  favorites,
  searchHistory,
  viewingHistory,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type PropertyImage,
  type InsertPropertyImage,
  type Review,
  type InsertReview,
  type Booking,
  type InsertBooking,
  type Favorite,
  type InsertFavorite,
  type SearchHistory,
  type InsertSearchHistory,
  type ViewingHistory,
  type InsertViewingHistory,
  type PropertyWithDetails,
  type PropertyWithStats,
  type UserWithDetails,
  type FavoriteWithProperty,
  type ViewingHistoryWithProperty,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, avg, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserWithDetails(id: string): Promise<UserWithDetails | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profileData: Partial<UpsertUser>): Promise<User>;
  updateUserPreferences(id: string, preferences: any): Promise<User>;
  updateNotificationSettings(id: string, settings: any): Promise<User>;
  updatePrivacySettings(id: string, settings: any): Promise<User>;
  
  // Favorites operations
  addToFavorites(userId: string, propertyId: number, notes?: string): Promise<Favorite>;
  removeFromFavorites(userId: string, propertyId: number): Promise<void>;
  getUserFavorites(userId: string): Promise<FavoriteWithProperty[]>;
  isPropertyFavorited(userId: string, propertyId: number): Promise<boolean>;
  
  // Search history operations
  addSearchHistory(userId: string, searchQuery: string, filters?: any): Promise<SearchHistory>;
  getUserSearchHistory(userId: string, limit?: number): Promise<SearchHistory[]>;
  clearSearchHistory(userId: string): Promise<void>;
  
  // Viewing history operations
  addViewingHistory(userId: string, propertyId: number): Promise<ViewingHistory>;
  getUserViewingHistory(userId: string, limit?: number): Promise<ViewingHistoryWithProperty[]>;
  clearViewingHistory(userId: string): Promise<void>;
  
  // Property operations
  getProperties(filters?: {
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    limit?: number;
    offset?: number;
  }): Promise<PropertyWithStats[]>;
  getProperty(id: number): Promise<PropertyWithDetails | undefined>;
  getFeaturedProperties(): Promise<PropertyWithStats[]>;
  getUserProperties(userId: string): Promise<PropertyWithStats[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;
  
  // Property image operations
  createPropertyImage(image: InsertPropertyImage): Promise<PropertyImage>;
  getPropertyImages(propertyId: number): Promise<PropertyImage[]>;
  deletePropertyImage(id: number): Promise<void>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getPropertyReviews(propertyId: number): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  deleteReview(id: number): Promise<void>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getPropertyBookings(propertyId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  deleteBooking(id: number): Promise<void>;
  
  // Search operations
  searchProperties(query: string): Promise<PropertyWithStats[]>;
}

export class DatabaseStorage implements IStorage {
  // Enhanced User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserWithDetails(id: string): Promise<UserWithDetails | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) return undefined;

    const [userFavorites, userSearchHistory, userViewingHistory, userProperties, userReviews, userBookings] = await Promise.all([
      this.getUserFavorites(id),
      this.getUserSearchHistory(id),
      this.getUserViewingHistory(id),
      this.getUserProperties(id),
      this.getUserReviews(id),
      this.getUserBookings(id),
    ]);

    return {
      ...user,
      roles: user.roles,
      currentRole: user.current_role, // map DB field to camelCase
      favorites: userFavorites.map(f => ({ id: f.id, userId: f.userId, propertyId: f.propertyId, notes: f.notes, createdAt: f.createdAt })),
      searchHistory: userSearchHistory,
      viewingHistory: userViewingHistory.map(v => ({ id: v.id, userId: v.userId, propertyId: v.propertyId, viewedAt: v.viewedAt })),
      properties: userProperties,
      reviews: userReviews,
      bookings: userBookings,
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profileData: Partial<UpsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserPreferences(id: string, preferences: any): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ preferences, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateNotificationSettings(id: string, settings: any): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ notificationSettings: settings, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updatePrivacySettings(id: string, settings: any): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ privacySettings: settings, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Favorites operations
  async addToFavorites(userId: string, propertyId: number, notes?: string): Promise<Favorite> {
    console.log('[addToFavorites] userId:', userId, 'propertyId:', propertyId, 'notes:', notes);
    if (!userId || !propertyId || isNaN(propertyId)) {
      console.error(`[addToFavorites] Invalid userId (${userId}) or propertyId (${propertyId})`);
      throw new Error(`Invalid userId (${userId}) or propertyId (${propertyId})`);
    }
    const values: any = { userId, propertyId };
    if (notes !== undefined) values.notes = notes;
    let favorite;
    if (notes !== undefined) {
      [favorite] = await db
        .insert(favorites)
        .values(values)
        .onConflictDoUpdate({
          target: [favorites.userId, favorites.propertyId],
          set: { notes },
        })
        .returning();
    } else {
      [favorite] = await db
        .insert(favorites)
        .values(values)
        .onConflictDoNothing()
        .returning();
    }
    return favorite;
  }

  async removeFromFavorites(userId: string, propertyId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)));
  }

  async getUserFavorites(userId: string): Promise<FavoriteWithProperty[]> {
    const userFavorites = await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        propertyId: favorites.propertyId,
        notes: favorites.notes,
        createdAt: favorites.createdAt,
        // Property fields
        title: properties.title,
        description: properties.description,
        price: properties.price,
        location: properties.location,
        city: properties.city,
        state: properties.state,
        zipCode: properties.zipCode,
        propertyType: properties.propertyType,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareFootage: properties.squareFootage,
        yearBuilt: properties.yearBuilt,
        parking: properties.parking,
        pool: properties.pool,
        gym: properties.gym,
        petFriendly: properties.petFriendly,
        furnished: properties.furnished,
        available: properties.available,
        featured: properties.featured,
        ownerId: properties.ownerId,
        propertyCreatedAt: properties.createdAt,
        propertyUpdatedAt: properties.updatedAt,
        averageRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(favorites)
      .innerJoin(properties, eq(favorites.propertyId, properties.id))
      .leftJoin(reviews, eq(properties.id, reviews.propertyId))
      .where(eq(favorites.userId, userId))
      .groupBy(favorites.id, properties.id)
      .orderBy(desc(favorites.createdAt));

    // Get images for each property
    const favoritesWithImages = await Promise.all(
      userFavorites.map(async (favorite) => {
        const images = await this.getPropertyImages(favorite.propertyId);
        const primaryImage = images.find(img => img.isPrimary) || images[0];
        
        return {
          id: favorite.id,
          userId: favorite.userId,
          propertyId: favorite.propertyId,
          notes: favorite.notes,
          createdAt: favorite.createdAt,
          property: {
            id: favorite.propertyId,
            title: favorite.title,
            description: favorite.description,
            price: favorite.price,
            location: favorite.location,
            city: favorite.city,
            state: favorite.state,
            zipCode: favorite.zipCode,
            propertyType: favorite.propertyType,
            bedrooms: favorite.bedrooms,
            bathrooms: favorite.bathrooms,
            squareFootage: favorite.squareFootage,
            yearBuilt: favorite.yearBuilt,
            parking: favorite.parking,
            pool: favorite.pool,
            gym: favorite.gym,
            petFriendly: favorite.petFriendly,
            furnished: favorite.furnished,
            available: favorite.available,
            featured: favorite.featured,
            ownerId: favorite.ownerId,
            createdAt: favorite.propertyCreatedAt,
            updatedAt: favorite.propertyUpdatedAt,
            images,
            primaryImage,
            averageRating: favorite.averageRating ? Number(favorite.averageRating) : 0,
            reviewCount: Number(favorite.reviewCount),
          },
        };
      })
    );

    return favoritesWithImages;
  }

  async isPropertyFavorited(userId: string, propertyId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)));
    return !!favorite;
  }

  // Search history operations
  async addSearchHistory(userId: string, searchQuery: string, filters?: any): Promise<SearchHistory> {
    const [searchRecord] = await db
      .insert(searchHistory)
      .values({ userId, searchQuery, filters })
      .returning();
    return searchRecord;
  }

  async getUserSearchHistory(userId: string, limit: number = 20): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.createdAt))
      .limit(limit);
  }

  async clearSearchHistory(userId: string): Promise<void> {
    await db
      .delete(searchHistory)
      .where(eq(searchHistory.userId, userId));
  }

  // Viewing history operations
  async addViewingHistory(userId: string, propertyId: number): Promise<ViewingHistory> {
    const [viewingRecord] = await db
      .insert(viewingHistory)
      .values({ userId, propertyId })
      .onConflictDoUpdate({
        target: [viewingHistory.userId, viewingHistory.propertyId],
        set: { viewedAt: new Date() },
      })
      .returning();
    return viewingRecord;
  }

  async getUserViewingHistory(userId: string, limit: number = 20): Promise<ViewingHistoryWithProperty[]> {
    const viewingRecords = await db
      .select({
        id: viewingHistory.id,
        userId: viewingHistory.userId,
        propertyId: viewingHistory.propertyId,
        viewedAt: viewingHistory.viewedAt,
        // Property fields
        title: properties.title,
        description: properties.description,
        price: properties.price,
        location: properties.location,
        city: properties.city,
        state: properties.state,
        zipCode: properties.zipCode,
        propertyType: properties.propertyType,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareFootage: properties.squareFootage,
        yearBuilt: properties.yearBuilt,
        parking: properties.parking,
        pool: properties.pool,
        gym: properties.gym,
        petFriendly: properties.petFriendly,
        furnished: properties.furnished,
        available: properties.available,
        featured: properties.featured,
        ownerId: properties.ownerId,
        propertyCreatedAt: properties.createdAt,
        propertyUpdatedAt: properties.updatedAt,
        averageRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(viewingHistory)
      .innerJoin(properties, eq(viewingHistory.propertyId, properties.id))
      .leftJoin(reviews, eq(properties.id, reviews.propertyId))
      .where(eq(viewingHistory.userId, userId))
      .groupBy(viewingHistory.id, properties.id)
      .orderBy(desc(viewingHistory.viewedAt))
      .limit(limit);

    // Get images for each property
    const viewingHistoryWithImages = await Promise.all(
      viewingRecords.map(async (record) => {
        const images = await this.getPropertyImages(record.propertyId);
        const primaryImage = images.find(img => img.isPrimary) || images[0];
        
        return {
          id: record.id,
          userId: record.userId,
          propertyId: record.propertyId,
          viewedAt: record.viewedAt,
          property: {
            id: record.propertyId,
            title: record.title,
            description: record.description,
            price: record.price,
            location: record.location,
            city: record.city,
            state: record.state,
            zipCode: record.zipCode,
            propertyType: record.propertyType,
            bedrooms: record.bedrooms,
            bathrooms: record.bathrooms,
            squareFootage: record.squareFootage,
            yearBuilt: record.yearBuilt,
            parking: record.parking,
            pool: record.pool,
            gym: record.gym,
            petFriendly: record.petFriendly,
            furnished: record.furnished,
            available: record.available,
            featured: record.featured,
            ownerId: record.ownerId,
            createdAt: record.propertyCreatedAt,
            updatedAt: record.propertyUpdatedAt,
            images,
            primaryImage,
            averageRating: record.averageRating ? Number(record.averageRating) : 0,
            reviewCount: Number(record.reviewCount),
          },
        };
      })
    );

    return viewingHistoryWithImages;
  }

  async clearViewingHistory(userId: string): Promise<void> {
    await db
      .delete(viewingHistory)
      .where(eq(viewingHistory.userId, userId));
  }

  // Property operations
  async getProperties(filters?: {
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    limit?: number;
    offset?: number;
  }): Promise<PropertyWithStats[]> {
    // Apply filters
    const conditions = [eq(properties.available, true)];
    
    if (filters?.location) {
      conditions.push(or(
        ilike(properties.location, `%${filters.location}%`),
        ilike(properties.city, `%${filters.location}%`),
        ilike(properties.state, `%${filters.location}%`)
      )!);
    }
    
    if (filters?.propertyType) {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }
    
    if (filters?.minPrice) {
      conditions.push(sql`${properties.price} >= ${filters.minPrice}`);
    }
    
    if (filters?.maxPrice) {
      conditions.push(sql`${properties.price} <= ${filters.maxPrice}`);
    }
    
    if (filters?.bedrooms) {
      conditions.push(sql`${properties.bedrooms} >= ${filters.bedrooms}`);
    }
    
    if (filters?.bathrooms) {
      conditions.push(sql`${properties.bathrooms} >= ${filters.bathrooms}`);
    }
    
    if (filters?.amenities?.length) {
      for (const amenity of filters.amenities) {
        switch (amenity) {
          case 'parking':
            conditions.push(eq(properties.parking, true));
            break;
          case 'pool':
            conditions.push(eq(properties.pool, true));
            break;
          case 'gym':
            conditions.push(eq(properties.gym, true));
            break;
          case 'petFriendly':
            conditions.push(eq(properties.petFriendly, true));
            break;
        }
      }
    }

    let query = db
      .select({
        id: properties.id,
        title: properties.title,
        description: properties.description,
        price: properties.price,
        location: properties.location,
        city: properties.city,
        state: properties.state,
        zipCode: properties.zipCode,
        propertyType: properties.propertyType,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareFootage: properties.squareFootage,
        yearBuilt: properties.yearBuilt,
        parking: properties.parking,
        pool: properties.pool,
        gym: properties.gym,
        petFriendly: properties.petFriendly,
        furnished: properties.furnished,
        available: properties.available,
        featured: properties.featured,
        ownerId: properties.ownerId,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
        averageRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(properties)
      .leftJoin(reviews, eq(properties.id, reviews.propertyId))
      .where(and(...conditions))
      .groupBy(properties.id)
      .orderBy(desc(properties.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const result = await query;
    
    // Get images for each property
    const propertiesWithImages = await Promise.all(
      result.map(async (property) => {
        const images = await this.getPropertyImages(property.id);
        const primaryImage = images.find(img => img.isPrimary) || images[0];
        return {
          ...property,
          images,
          primaryImage,
          averageRating: property.averageRating ? Number(property.averageRating) : 0,
          reviewCount: Number(property.reviewCount),
        };
      })
    );

    return propertiesWithImages;
  }

  async getProperty(id: number): Promise<PropertyWithDetails | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    
    if (!property) return undefined;

    const [images, propertyReviews, owner] = await Promise.all([
      this.getPropertyImages(id),
      this.getPropertyReviews(id),
      this.getUser(property.ownerId),
    ]);

    return {
      ...property,
      images,
      reviews: propertyReviews,
      owner: owner!,
    };
  }

  async getFeaturedProperties(): Promise<PropertyWithStats[]> {
    return this.getProperties({ limit: 6 });
  }

  async getUserProperties(userId: string): Promise<PropertyWithStats[]> {
    const userProperties = await db
      .select({
        id: properties.id,
        title: properties.title,
        description: properties.description,
        price: properties.price,
        location: properties.location,
        city: properties.city,
        state: properties.state,
        zipCode: properties.zipCode,
        propertyType: properties.propertyType,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareFootage: properties.squareFootage,
        yearBuilt: properties.yearBuilt,
        parking: properties.parking,
        pool: properties.pool,
        gym: properties.gym,
        petFriendly: properties.petFriendly,
        furnished: properties.furnished,
        available: properties.available,
        featured: properties.featured,
        ownerId: properties.ownerId,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
        averageRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(properties)
      .leftJoin(reviews, eq(properties.id, reviews.propertyId))
      .where(eq(properties.ownerId, userId))
      .groupBy(properties.id)
      .orderBy(desc(properties.createdAt));

    const propertiesWithImages = await Promise.all(
      userProperties.map(async (property) => {
        const images = await this.getPropertyImages(property.id);
        const primaryImage = images.find(img => img.isPrimary) || images[0];
        return {
          ...property,
          images,
          primaryImage,
          averageRating: property.averageRating ? Number(property.averageRating) : 0,
          reviewCount: Number(property.reviewCount),
        };
      })
    );

    return propertiesWithImages;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Property image operations
  async createPropertyImage(image: InsertPropertyImage): Promise<PropertyImage> {
    const [newImage] = await db.insert(propertyImages).values(image).returning();
    return newImage;
  }

  async getPropertyImages(propertyId: number): Promise<PropertyImage[]> {
    return await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.id));
  }

  async deletePropertyImage(id: number): Promise<void> {
    await db.delete(propertyImages).where(eq(propertyImages.id, id));
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getPropertyReviews(propertyId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.propertyId, propertyId))
      .orderBy(desc(reviews.createdAt));
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getPropertyBookings(propertyId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.propertyId, propertyId))
      .orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  // Search operations
  async searchProperties(query: string): Promise<PropertyWithStats[]> {
    return this.getProperties({
      location: query,
      limit: 20,
    });
  }

  async deleteUserAccount(userId: string): Promise<void> {
    // Delete favorites
    await db.delete(favorites).where(eq(favorites.userId, userId));
    // Delete reviews
    await db.delete(reviews).where(eq(reviews.userId, userId));
    // Delete bookings
    await db.delete(bookings).where(eq(bookings.userId, userId));
    // Delete search history
    await db.delete(searchHistory).where(eq(searchHistory.userId, userId));
    // Delete viewing history
    await db.delete(viewingHistory).where(eq(viewingHistory.userId, userId));
    // Delete property images for user's properties
    const userProperties = await db.select().from(properties).where(eq(properties.ownerId, userId));
    for (const property of userProperties) {
      await db.delete(propertyImages).where(eq(propertyImages.propertyId, property.id));
    }
    // Delete properties owned by user
    await db.delete(properties).where(eq(properties.ownerId, userId));
    // Delete user
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
