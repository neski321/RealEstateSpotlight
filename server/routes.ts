import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./firebaseAuth";
import { 
  insertPropertySchema,
  insertPropertyImageSchema,
  insertReviewSchema,
  insertBookingSchema,
  insertContactMessageSchema,
} from "@shared/schema";
import { adminAuth } from './firebase';
import multer from "multer";
import { ImageService } from "./cloudflare-r2";

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Configure multer for file uploads
  const maxFileSize = parseInt(process.env.MAX_IMAGE_SIZE_MB || '10') * 1024 * 1024; // Default 10MB
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
  });

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

  // Remove debug endpoint to get Firebase UID and email

  // User profile routes
  app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      let user = await storage.getUserWithDetails(userId);
      
      // If user doesn't exist in our database, create a basic user record
      if (!user) {
        console.log(`[user/profile] User ${userId} not found in database, creating basic user record`);
        const firebaseUser = req.user;
        
        // Create basic user with default roles
        await storage.createUser({
          id: userId,
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          roles: ['user'], // Default role
          currentRole: 'user'
        });
        
        console.log(`[user/profile] Created basic user record for ${userId}`);
        
        // Get the user with details after creation
        user = await storage.getUserWithDetails(userId);
      }
      
      // Ensure roles and currentRole are included in the response
      res.json({
        ...user,
        roles: user?.roles ?? [],
        currentRole: user?.currentRole ?? null,
      });
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

  app.put('/api/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const { currentRole, roles } = req.body;
      // Only allow updating roles if provided, otherwise just update currentRole
      const updateData: any = {};
      if (currentRole) updateData.currentRole = currentRole;
      if (roles) updateData.roles = roles;
      // Update in DB
      const updatedUser = await storage.updateUserProfile(userId, updateData);
      // Update Firebase custom claims
      await adminAuth.setCustomUserClaims(userId, {
        roles: updatedUser.roles,
        currentRole: updatedUser.currentRole,
      });
      res.json({
        message: 'Role(s) updated and synced with Firebase.',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update user role.' });
    }
  });

  // Favorites routes
  app.post('/api/favorites/:propertyId', isAuthenticated, async (req: any, res) => {
    console.log('[ROUTE] POST /api/favorites/:propertyId called', req.user, req.params.propertyId, req.body);
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

  // Image upload endpoints
  app.post("/api/admin/upload/image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const { folder = 'properties' } = req.body;
      const result = await ImageService.uploadFile(
        req.file.buffer,
        req.file.mimetype,
        folder
      );

      res.json({
        url: result.url,
        key: result.key,
        message: "Image uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Image delete endpoint
  app.delete("/api/admin/upload/image", async (req, res) => {
    try {
      const { key } = req.body;
      
      if (!key) {
        return res.status(400).json({ message: "Image key is required" });
      }

      const deleted = await ImageService.deleteFile(key);
      
      if (deleted) {
        res.json({ message: "Image deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete image" });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
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

  // Contact message routes
  app.post('/api/contact', async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Admin routes
  app.get('/api/admin/contact-messages', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin (you can implement your own admin check logic)
      const user = await storage.getUser(req.user.uid);
      if (!user || !(user.roles as string[])?.includes('admin')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const messages = await storage.getContactMessages(limit, offset);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // Temporary admin route for testing (remove in production)
  app.get('/api/admin/contact-messages-test', async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const messages = await storage.getContactMessages(limit, offset);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // Temporary endpoint to make a user admin (remove in production)
  app.post('/api/admin/make-admin', async (req: any, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user to have admin role
      const updatedUser = await storage.updateUserProfile(user.id, {
        roles: ['admin'],
        currentRole: 'admin'
      });

      res.json({ 
        message: "User made admin successfully", 
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ message: "Failed to make user admin" });
    }
  });

  // Create admin user directly (for admin signup)
  app.post('/api/admin/create-admin', isAuthenticated, async (req: any, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, firstName, and lastName are required" });
      }

      // Use the authenticated user's UID
      const uid = req.user.uid;

      // Check if user already exists by UID first
      const existingUserById = await storage.getUser(uid);
      if (existingUserById) {
        // Update existing user to have admin privileges
        const updatedUser = await storage.updateUserProfile(uid, {
          firstName,
          lastName,
          roles: ['admin'],
          currentRole: 'admin'
        });
        
        res.status(200).json({ 
          message: "Admin privileges granted successfully", 
          user: updatedUser 
        });
        return;
      }

      // Check if user already exists by email
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Create new user with admin privileges
      const newUser = await storage.createUser({
        id: uid, // Use the authenticated user's UID
        email,
        firstName,
        lastName,
        roles: ['admin'],
        currentRole: 'admin'
      });

      res.status(201).json({ 
        message: "Admin user created successfully", 
        user: newUser 
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Temporary endpoint to list all users (remove in production)
  app.get('/api/admin/users', async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all seller accounts (admin only)
  app.get('/api/admin/sellers', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = await storage.getUser(req.user.uid);
      if (!user || !(user.roles as string[])?.includes('admin')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const sellers = await storage.getSellerAccounts();
      res.json(sellers);
    } catch (error) {
      console.error("Error fetching seller accounts:", error);
      res.status(500).json({ message: "Failed to fetch seller accounts" });
    }
  });

  // Get total properties count (admin only)
  app.get('/api/admin/total-properties', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = await storage.getUser(req.user.uid);
      if (!user || !(user.roles as string[])?.includes('admin')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const total = await storage.getTotalPropertiesCount();
      res.json({ total });
    } catch (error) {
      console.error("Error fetching total properties count:", error);
      res.status(500).json({ message: "Failed to fetch total properties count" });
    }
  });

  app.get('/api/admin/contact-messages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.uid);
      if (!user || !(user.roles as string[])?.includes('admin')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const message = await storage.getContactMessage(id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error fetching contact message:", error);
      res.status(500).json({ message: "Failed to fetch contact message" });
    }
  });

  app.put('/api/admin/contact-messages/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.uid);
      if (!user || !(user.roles as string[])?.includes('admin')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['unread', 'read', 'responded'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const message = await storage.updateContactMessageStatus(id, status);
      res.json(message);
    } catch (error) {
      console.error("Error updating contact message status:", error);
      res.status(500).json({ message: "Failed to update message status" });
    }
  });

  app.post('/api/admin/contact-messages/:id/reply', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.uid);
      if (!user || !(user.roles as string[])?.includes('admin')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const { reply } = req.body;

      if (!reply || !reply.trim()) {
        return res.status(400).json({ message: "Reply text is required" });
      }

      // Get the original message
      const originalMessage = await storage.getContactMessage(id);
      if (!originalMessage) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Send email reply
      await storage.sendContactMessageReply(id, originalMessage, reply);

      // Update message status to responded
      await storage.updateContactMessageStatus(id, 'responded');

      res.json({ message: "Reply sent successfully" });
    } catch (error) {
      console.error("Error sending reply:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  app.delete('/api/admin/contact-messages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.uid);
      if (!user || !(user.roles as string[])?.includes('admin')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteContactMessage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete message" });
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
