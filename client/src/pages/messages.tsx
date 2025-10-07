import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  propertyId: number;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string;
  unreadCount: number;
  property: {
    id: number;
    title: string;
    price: string;
    location: string;
    primaryImage: string;
  };
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
}

interface Message {
  id: number;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
}

export default function Messages() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations", {
        headers: {
          Authorization: `Bearer ${await currentUser?.getIdToken()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${await currentUser?.getIdToken()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read
        await fetch(`/api/conversations/${conversationId}/messages/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${await currentUser?.getIdToken()}`,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({
          messageText: newMessage.trim(),
          messageType: "text",
        }),
      });

      if (response.ok) {
        setNewMessage("");
        // Refresh messages
        await fetchMessages(selectedConversation.id);
        // Refresh conversations to update last message
        await fetchConversations();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get other user in conversation
  const getOtherUser = (conversation: Conversation) => {
    if (currentUser?.uid === conversation.buyerId) {
      return conversation.seller;
    }
    return conversation.buyer;
  };

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Messages</h1>
          </div>
          <p className="text-muted-foreground">Manage your conversations with buyers and sellers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start by contacting a seller about a property</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      const isSelected = selectedConversation?.id === conversation.id;
                      
                      return (
                        <div
                          key={conversation.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            isSelected ? "bg-muted" : ""
                          }`}
                          onClick={() => handleConversationSelect(conversation)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={otherUser.profileImageUrl} />
                              <AvatarFallback>
                                {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium truncate">
                                  {otherUser.firstName} {otherUser.lastName}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.property.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessageAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Thread */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getOtherUser(selectedConversation).profileImageUrl} />
                      <AvatarFallback>
                        {getOtherUser(selectedConversation).firstName?.[0]}
                        {getOtherUser(selectedConversation).lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {getOtherUser(selectedConversation).firstName} {getOtherUser(selectedConversation).lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        About: {selectedConversation.property.title}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[500px]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.senderId === currentUser?.uid;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.messageText}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[40px] max-h-[120px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
