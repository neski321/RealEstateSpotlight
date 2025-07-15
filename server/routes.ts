import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./firebaseAuth";
import { 
  insertPropertySchema,
  insertPropertyImageSchema,
  insertReviewSchema,
  insertBookingSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Debug endpoint to get Firebase UID and email
  app.get('/api/auth/debug-id', isAuthenticated, async (req: any, res) => {
    try {
      res.json({
        uid: req.user.uid,
        email: req.user.email,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user info' });
    }
  });

  // User profile routes
  app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserWithDetails(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const profileData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      const { id, email, createdAt, updatedAt, ...updateableFields } = profileData;
      
      const updatedUser = await storage.updateUserProfile(userId, updateableFields);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const preferences = req.body;
      
      const updatedUser = await storage.updateUserPreferences(userId, preferences);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  app.put('/api/user/notification-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const settings = req.body;
      
      const updatedUser = await storage.updateNotificationSettings(userId, settings);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  app.put('/api/user/privacy-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const settings = req.body;
      
      const updatedUser = await storage.updatePrivacySettings(userId, settings);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });

  // Favorites routes
  app.post('/api/favorites/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const propertyId = parseInt(req.params.propertyId);
      const { notes } = req.body;
      
      const favorite = await storage.addToFavorites(userId, propertyId, notes);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete('/api/favorites/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const propertyId = parseInt(req.params.propertyId);
      
      await storage.removeFromFavorites(userId, propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.get('/api/favorites/:propertyId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const propertyId = parseInt(req.params.propertyId);
      
      const isFavorited = await storage.isPropertyFavorited(userId, propertyId);
      res.json({ isFavorited });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Search history routes
  app.post('/api/search-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const { searchQuery, filters } = req.body;
      
      const searchRecord = await storage.addSearchHistory(userId, searchQuery, filters);
      res.status(201).json(searchRecord);
    } catch (error) {
      console.error("Error adding search history:", error);
      res.status(500).json({ message: "Failed to add search history" });
    }
  });

  app.get('/api/search-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const searchHistory = await storage.getUserSearchHistory(userId, limit);
      res.json(searchHistory);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  app.delete('/api/search-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      
      await storage.clearSearchHistory(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing search history:", error);
      res.status(500).json({ message: "Failed to clear search history" });
    }
  });

  // Viewing history routes
  app.post('/api/viewing-history/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const propertyId = parseInt(req.params.propertyId);
      
      const viewingRecord = await storage.addViewingHistory(userId, propertyId);
      res.status(201).json(viewingRecord);
    } catch (error) {
      console.error("Error adding viewing history:", error);
      res.status(500).json({ message: "Failed to add viewing history" });
    }
  });

  app.get('/api/viewing-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const viewingHistory = await storage.getUserViewingHistory(userId, limit);
      res.json(viewingHistory);
    } catch (error) {
      console.error("Error fetching viewing history:", error);
      res.status(500).json({ message: "Failed to fetch viewing history" });
    }
  });

  app.delete('/api/viewing-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      
      await storage.clearViewingHistory(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing viewing history:", error);
      res.status(500).json({ message: "Failed to clear viewing history" });
    }
  });

  // Property routes
  app.get('/api/properties', async (req, res) => {
    try {
      const {
        location,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        amenities,
        limit = 20,
        offset = 0,
      } = req.query;

      const filters = {
        location: location as string,
        propertyType: propertyType as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        amenities: amenities ? (amenities as string).split(',') : undefined,
        limit: Number(limit),
        offset: Number(offset),
      };

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/featured', async (req, res) => {
    try {
      const properties = await storage.getFeaturedProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      res.status(500).json({ message: "Failed to fetch featured properties" });
    }
  });

  app.get('/api/properties/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const properties = await storage.searchProperties(q as string);
      res.json(properties);
    } catch (error) {
      console.error("Error searching properties:", error);
      res.status(500).json({ message: "Failed to search properties" });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        ownerId: userId,
      });
      
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.uid;
      
      // Check if user owns the property
      const existingProperty = await storage.getProperty(id);
      if (!existingProperty || existingProperty.ownerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const propertyData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, propertyData);
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.uid;
      
      // Check if user owns the property
      const existingProperty = await storage.getProperty(id);
      if (!existingProperty || existingProperty.ownerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteProperty(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // User property routes
  app.get('/api/user/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const properties = await storage.getUserProperties(userId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching user properties:", error);
      res.status(500).json({ message: "Failed to fetch user properties" });
    }
  });

  // Property image routes
  app.post('/api/properties/:id/images', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user.uid;
      
      // Check if user owns the property
      const property = await storage.getProperty(propertyId);
      if (!property || property.ownerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const imageData = insertPropertyImageSchema.parse({
        ...req.body,
        propertyId,
      });
      
      const image = await storage.createPropertyImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error adding property image:", error);
      res.status(500).json({ message: "Failed to add property image" });
    }
  });

  app.delete('/api/property-images/:id', isAuthenticated, async (req: any, res) => {
    try {
      const imageId = parseInt(req.params.id);
      await storage.deletePropertyImage(imageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property image:", error);
      res.status(500).json({ message: "Failed to delete property image" });
    }
  });

  // Review routes
  app.post('/api/properties/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user.uid;
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        propertyId,
        userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/properties/:id/reviews', async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const reviews = await storage.getPropertyReviews(propertyId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Booking routes
  app.post('/api/properties/:id/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user.uid;
      
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        propertyId,
        userId,
      });
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/user/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });

  // Delete user account and all related data
  app.delete('/api/user/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      // Remove user and all related data
      await storage.deleteUserAccount(userId);
      res.json({ message: 'User account and related data deleted.' });
    } catch (error) {
      console.error('Error deleting user account:', error);
      res.status(500).json({ message: 'Failed to delete user account.' });
    }
  });

  return server;
}
