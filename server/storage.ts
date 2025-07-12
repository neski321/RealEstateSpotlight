import {
  users,
  properties,
  propertyImages,
  reviews,
  bookings,
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
  type PropertyWithDetails,
  type PropertyWithStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, avg, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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
}

export const storage = new DatabaseStorage();
