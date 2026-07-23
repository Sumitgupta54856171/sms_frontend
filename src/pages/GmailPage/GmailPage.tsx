import { useState } from "react";
import { Send, Paperclip, Trash2, Mail, Inbox, SendHorizonal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { sendEmail } from "@/api/email";

export default function GmailPage() {
  const [recipientType, setRecipientType] = useState<string>("all");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }
    if (recipientType === "single" && !recipientEmail.trim()) {
      toast.error("Recipient email is required");
      return;
    }

    setSending(true);
    try {
      await sendEmail({
        recipientType,
        recipientEmail: recipientType === "single" ? recipientEmail : undefined,
        subject,
        message,
      });
      toast.success("Email sent successfully!");
      setSubject("");
      setMessage("");
      setRecipientEmail("");
      setAttachment(null);
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] p-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Mail className="h-6 w-6 text-[#0d9488]" />
              Gmail
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Send emails to students, teachers, or parents.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <Card className="border-none shadow-sm bg-white rounded-2xl lg:col-span-1">
            <CardContent className="p-4 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 bg-teal-50 text-teal-700 font-medium rounded-lg"
              >
                <Inbox className="h-4 w-4" />
                Compose
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <SendHorizonal className="h-4 w-4" />
                Sent
              </Button>
            </CardContent>
          </Card>

          {/* Compose Form */}
          <Card className="border-none shadow-sm bg-white rounded-2xl lg:col-span-2">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#0d9488]" />
                Compose Email
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Recipient Type */}
              <div className="space-y-2">
                <Label htmlFor="recipient-type">Send To</Label>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger id="recipient-type">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students & Parents</SelectItem>
                    <SelectItem value="teachers">All Teachers</SelectItem>
                    <SelectItem value="students">All Students</SelectItem>
                    <SelectItem value="parents">All Parents</SelectItem>
                    <SelectItem value="single">Single Recipient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Single Email */}
              {recipientType === "single" && (
                <div className="space-y-2">
                  <Label htmlFor="recipient-email">Recipient Email</Label>
                  <Input
                    id="recipient-email"
                    type="email"
                    placeholder="email@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  placeholder="Type your message here..."
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              {/* Attachment */}
              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment (optional)</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="border-slate-200 text-slate-600"
                    onClick={() => document.getElementById("attachment-input")?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                  <input
                    id="attachment-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  />
                  {attachment && (
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      {attachment.name}
                      <button
                        onClick={() => setAttachment(null)}
                        className="text-red-400 hover:text-red-600 ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {/* Send Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSend}
                  disabled={sending}
                  className="bg-[#0d9488] hover:bg-teal-700 text-white shadow-sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
