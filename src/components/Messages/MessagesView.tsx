import { useState } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ChevronLeft,
  Check,
  CheckCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  lastTime: Date;
  unread: number;
  online: boolean;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: "Dr. Sharma",
    role: "Principal",
    lastMessage: "Please submit the reports by tomorrow.",
    lastTime: new Date(2026, 6, 13, 10, 30),
    unread: 2,
    online: true,
    messages: [
      {
        id: 1,
        senderId: 1,
        text: "Good morning! Have you prepared the monthly reports?",
        timestamp: new Date(2026, 6, 13, 9, 0),
        read: true,
      },
      {
        id: 2,
        senderId: 0,
        text: "Yes, I'm working on them. Almost done.",
        timestamp: new Date(2026, 6, 13, 9, 15),
        read: true,
      },
      {
        id: 3,
        senderId: 1,
        text: "Please submit the reports by tomorrow.",
        timestamp: new Date(2026, 6, 13, 10, 30),
        read: false,
      },
      {
        id: 4,
        senderId: 1,
        text: "Also, we need to discuss the upcoming event.",
        timestamp: new Date(2026, 6, 13, 10, 31),
        read: false,
      },
    ],
  },
  {
    id: 2,
    name: "Mrs. Patel",
    role: "Teacher",
    lastMessage: "Thank you for the update!",
    lastTime: new Date(2026, 6, 12, 14, 0),
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        senderId: 2,
        text: "The class assignment has been completed.",
        timestamp: new Date(2026, 6, 12, 13, 0),
        read: true,
      },
      {
        id: 2,
        senderId: 0,
        text: "Great work! Please share the list.",
        timestamp: new Date(2026, 6, 12, 13, 30),
        read: true,
      },
      {
        id: 3,
        senderId: 2,
        text: "Thank you for the update!",
        timestamp: new Date(2026, 6, 12, 14, 0),
        read: true,
      },
    ],
  },
  {
    id: 3,
    name: "Mr. Verma",
    role: "Accountant",
    lastMessage: "The fee collection report is ready.",
    lastTime: new Date(2026, 6, 11, 11, 0),
    unread: 0,
    online: true,
    messages: [
      {
        id: 1,
        senderId: 3,
        text: "The fee collection report is ready.",
        timestamp: new Date(2026, 6, 11, 11, 0),
        read: true,
      },
    ],
  },
  {
    id: 4,
    name: "Ms. Gupta",
    role: "Teacher",
    lastMessage: "Can I get the science lab keys?",
    lastTime: new Date(2026, 6, 10, 16, 0),
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        senderId: 4,
        text: "Can I get the science lab keys?",
        timestamp: new Date(2026, 6, 10, 16, 0),
        read: true,
      },
    ],
  },
];

export default function MessagesView() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");

  const activeConversation = conversations.find((c) => c.id === activeChat);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!messageText.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now(),
      senderId: 0,
      text: messageText.trim(),
      timestamp: new Date(),
      read: false,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeChat) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: newMessage.text,
            lastTime: newMessage.timestamp,
          };
        }
        return conv;
      })
    );
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (d: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return formatTime(d);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <MessageSquare className="h-6 w-6" />
            </span>
            Messages
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Communicate with staff, teachers, and administration.
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="flex h-150">
            {/* Sidebar - Conversation List */}
            <div className="w-full sm:w-80 border-r border-slate-200 flex flex-col bg-white">
              {/* Search */}
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-slate-50 border-slate-200 text-sm"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveChat(conv.id)}
                      className={`w-full text-left p-3 flex items-center gap-3 transition-colors hover:bg-slate-50 border-b border-slate-50 ${
                        activeChat === conv.id
                          ? "bg-indigo-50 border-l-2 border-l-indigo-600"
                          : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback
                            className={`text-sm font-semibold ${
                              conv.role === "Principal"
                                ? "bg-amber-100 text-amber-700"
                                : conv.role === "Accountant"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {getInitials(conv.name)}
                          </AvatarFallback>
                        </Avatar>
                        {conv.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {conv.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {formatDate(conv.lastTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-slate-500 truncate">
                            {conv.lastMessage}
                          </span>
                          {conv.unread > 0 && (
                            <Badge className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full bg-[#0d9488] text-white text-[10px] px-1.5">
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="hidden sm:flex flex-1 flex-col bg-white">
              {!activeConversation ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm mt-1">
                      Choose a person to start messaging.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveChat(null)}
                        className="sm:hidden p-1 hover:bg-slate-100 rounded"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback
                          className={`text-sm font-semibold ${
                            activeConversation.role === "Principal"
                              ? "bg-amber-100 text-amber-700"
                              : activeConversation.role === "Accountant"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {getInitials(activeConversation.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {activeConversation.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {activeConversation.online ? "Online" : "Offline"} ·{" "}
                          {activeConversation.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-slate-400"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-slate-400"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-slate-400"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {activeConversation.messages.map((msg) => {
                      const isMe = msg.senderId === 0;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isMe
                                ? "bg-[#0d9488] text-white rounded-br-md"
                                : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span
                                className={`text-[10px] ${
                                  isMe ? "text-indigo-200" : "text-slate-400"
                                }`}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                              {isMe && (
                                msg.read ? (
                                  <CheckCheck className="h-3 w-3 text-indigo-200" />
                                ) : (
                                  <Check className="h-3 w-3 text-indigo-200" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-slate-100 bg-white">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-600 shrink-0"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 relative">
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message..."
                          rows={1}
                          className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                          style={{ minHeight: "40px", maxHeight: "120px" }}
                        />
                      </div>
                      <Button
                        onClick={handleSend}
                        disabled={!messageText.trim()}
                        className="h-9 w-9 rounded-full bg-[#0d9488] hover:bg-teal-700 text-white p-0 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
