import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function MessagesModal({ isOpen, onClose }: MessagesModalProps) {
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
    if (currentUser && isOpen) {
      fetchConversations();
    }
  }, [currentUser, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Conversations</h3>
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
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
                          className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg ${
                            isSelected ? "bg-muted" : ""
                          }`}
                          onClick={() => handleConversationSelect(conversation)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={otherUser.profileImageUrl} />
                              <AvatarFallback>
                                {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium truncate text-sm">
                                  {otherUser.firstName} {otherUser.lastName}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
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
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getOtherUser(selectedConversation).profileImageUrl} />
                      <AvatarFallback>
                        {getOtherUser(selectedConversation).firstName?.[0]}
                        {getOtherUser(selectedConversation).lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {getOtherUser(selectedConversation).firstName} {getOtherUser(selectedConversation).lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        About: {selectedConversation.property.title}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
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
                </div>
                
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
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
