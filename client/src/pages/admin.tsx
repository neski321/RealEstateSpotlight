import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Clock, User, MessageSquare, Trash2, Eye, CheckCircle, AlertCircle, Shield, Users, Building, Send, Reply } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  category?: string;
  message: string;
  status: "unread" | "read" | "responded";
  createdAt: string;
  updatedAt: string;
}

interface SellerAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  phone?: string;
  bio?: string;
  isAgent: boolean;
  agentLicense?: string;
  agentCompany?: string;
  agentExperience?: number;
  propertyCount: number;
  createdAt: string;
  updatedAt: string;
}

type AdminSection = 'dashboard' | 'messages' | 'sellers';

export default function AdminPage() {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [sellers, setSellers] = useState<SellerAccount[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewingMessage, setIsViewingMessage] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const { toast } = useToast();
  const { currentUser, roles, currentRole } = useAuth();

  useEffect(() => {
    // Check if user is logged in and has admin role
    if (!currentUser) {
      // Redirect to home page without notification
      window.location.href = '/';
      return;
    }

    // Check if user has admin role
    if (!roles.includes('admin')) {
      // Redirect to home page without notification
      window.location.href = '/';
      return;
    }

    setLoading(false);
  }, [currentUser, roles]);

  const fetchMessages = async () => {
    try {
      // Debug: Log authentication status
      console.log('Current user:', currentUser);
      console.log('User roles:', roles);
      console.log('Current role:', currentRole);
      
      // Debug: Check if we have a token
      const token = await auth.currentUser?.getIdToken();
      console.log('Firebase token available:', !!token);
      
      const response = await api.get('/api/admin/contact-messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Failed to fetch messages",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await api.get('/api/admin/sellers');
      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast({
        title: "Failed to fetch sellers",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const fetchTotalProperties = async () => {
    try {
      const response = await api.get('/api/admin/total-properties');
      const data = await response.json();
      setTotalProperties(data.total);
    } catch (error) {
      console.error("Error fetching total properties:", error);
      // Don't show toast for this as it's not critical
    }
  };

  const updateMessageStatus = async (messageId: number, status: string) => {
    try {
      await api.put(`/api/admin/contact-messages/${messageId}/status`, { status });
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: status as "unread" | "read" | "responded" } : msg
      ));
      toast({
        title: "Status updated",
        description: "Message status has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Failed to update status",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await api.delete(`/api/admin/contact-messages/${messageId}`);
      setMessages(messages.filter(msg => msg.id !== messageId));
      toast({
        title: "Message deleted",
        description: "Message has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Failed to delete message",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const sendReply = async (messageId: number, replyText: string) => {
    try {
      setIsReplying(true);
      await api.post(`/api/admin/contact-messages/${messageId}/reply`, {
        reply: replyText
      });
      
      // Update message status to responded
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'responded' } : msg
      ));
      
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      });
      
      setReplyText('');
      setShowReplyDialog(false);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Failed to send reply",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Unread</Badge>;
      case "read":
        return <Badge variant="secondary" className="flex items-center gap-1"><Eye className="h-3 w-3" /> Read</Badge>;
      case "responded":
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Responded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSectionChange = (section: AdminSection) => {
    setCurrentSection(section);
    if (section === 'messages') {
      fetchMessages();
    } else if (section === 'sellers') {
      fetchSellers();
    } else if (section === 'dashboard') {
      fetchTotalProperties();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-6xl mx-auto p-6 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-xl text-muted-foreground">Manage your platform</p>
          
          {/* Authentication Status */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            <div className="text-sm space-y-1">
              <p>Logged in: {currentUser ? 'Yes' : 'No'}</p>
              <p>User email: {currentUser?.email || 'Not logged in'}</p>
              <p>User roles: {roles.join(', ') || 'No roles'}</p>
              <p>Current role: {currentRole || 'None'}</p>
              <p>Has admin role: {roles.includes('admin') ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={currentSection === 'dashboard' ? 'default' : 'outline'}
            onClick={() => handleSectionChange('dashboard')}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={currentSection === 'messages' ? 'default' : 'outline'}
            onClick={() => handleSectionChange('messages')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Contact Messages
          </Button>
          <Button
            variant={currentSection === 'sellers' ? 'default' : 'outline'}
            onClick={() => handleSectionChange('sellers')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Seller Accounts
          </Button>
        </div>

        {/* Dashboard Section */}
        {currentSection === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{messages.length}</p>
                      <p className="text-sm text-muted-foreground">Total Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{sellers.length}</p>
                      <p className="text-sm text-muted-foreground">Seller Accounts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{totalProperties}</p>
                      <p className="text-sm text-muted-foreground">Total Properties</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSectionChange('messages')}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    View Contact Messages
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSectionChange('sellers')}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    View Seller Accounts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Messages Section */}
        {currentSection === 'messages' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Messages
              </CardTitle>
              <CardDescription>
                {messages.length} total messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{message.subject}</h3>
                            {getStatusBadge(message.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {message.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {message.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          {message.category && (
                            <Badge variant="outline" className="mb-2">{message.category}</Badge>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedMessage(message)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{message.subject}</DialogTitle>
                                <DialogDescription>
                                  Message from {message.name} ({message.email})
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Status:</span>
                                  {getStatusBadge(message.status)}
                                </div>
                                {message.category && (
                                  <div>
                                    <span className="text-sm font-medium">Category:</span>
                                    <Badge variant="outline" className="ml-2">{message.category}</Badge>
                                  </div>
                                )}
                                <div>
                                  <span className="text-sm font-medium">Message:</span>
                                  <p className="mt-2 text-sm whitespace-pre-wrap">{message.message}</p>
                                </div>
                                <div className="flex items-center gap-2 pt-4">
                                  <span className="text-sm font-medium">Update Status:</span>
                                  <Select
                                    value={message.status}
                                    onValueChange={(value) => updateMessageStatus(message.id, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unread">Unread</SelectItem>
                                      <SelectItem value="read">Read</SelectItem>
                                      <SelectItem value="responded">Responded</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Reply to {message.name}:</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedMessage(message);
                                        setShowReplyDialog(true);
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <Reply className="h-4 w-4" />
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sellers Section */}
        {currentSection === 'sellers' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Seller Accounts
              </CardTitle>
              <CardDescription>
                {sellers.length} total seller accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sellers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No seller accounts found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sellers.map((seller) => (
                    <div key={seller.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{seller.firstName} {seller.lastName}</h3>
                            {seller.isAgent && (
                              <Badge variant="default" className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                Agent
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {seller.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(seller.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {seller.propertyCount} {seller.propertyCount === 1 ? 'property' : 'properties'}
                            </span>
                          </div>
                          {seller.phone && (
                            <p className="text-sm text-muted-foreground mb-2">
                              Phone: {seller.phone}
                            </p>
                          )}
                          {seller.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {seller.bio}
                            </p>
                          )}
                          {seller.isAgent && (
                            <div className="space-y-1">
                              {seller.agentLicense && (
                                <p className="text-sm text-muted-foreground">
                                  License: {seller.agentLicense}
                                </p>
                              )}
                              {seller.agentCompany && (
                                <p className="text-sm text-muted-foreground">
                                  Company: {seller.agentCompany}
                                </p>
                              )}
                              {seller.agentExperience && (
                                <p className="text-sm text-muted-foreground">
                                  Experience: {seller.agentExperience} years
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
            <DialogDescription>
              Send a direct email to {selectedMessage?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Reply:</label>
              <Textarea
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReplyDialog(false);
                  setReplyText('');
                }}
                disabled={isReplying}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedMessage && sendReply(selectedMessage.id, replyText)}
                disabled={!replyText.trim() || isReplying}
                className="flex items-center gap-2"
              >
                {isReplying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
} 