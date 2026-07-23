import { useState } from "react";
import { Send, Smartphone, Users, UserCheck } from "lucide-react";
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
import { sendSms } from "@/api/sms";

export default function SmsAlertPage() {
  const [recipientType, setRecipientType] = useState<string>("all");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }
    if (recipientType === "single" && !phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setSending(true);
    try {
      await sendSms({
        recipientType,
        phoneNumber: recipientType === "single" ? phoneNumber : undefined,
        message,
      });
      toast.success("SMS sent successfully!");
      setMessage("");
      setPhoneNumber("");
    } catch {
      toast.error("Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] p-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-[#0d9488]" />
              SMS Alert
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Send SMS alerts to students, teachers, or parents.
            </p>
          </div>
        </div>

        {/* Compose SMS */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#0d9488]" />
              Compose SMS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Recipient Type */}
            <div className="space-y-2">
              <Label htmlFor="sms-recipient-type">Send To</Label>
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger id="sms-recipient-type">
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

            {/* Single Phone */}
            {recipientType === "single" && (
              <div className="space-y-2">
                <Label htmlFor="sms-phone">Phone Number</Label>
                <Input
                  id="sms-phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            )}

            {/* Recipient count hint */}
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              {recipientType === "all" && (
                <>
                  <Users className="h-4 w-4 text-[#0d9488]" />
                  Sending to all students, parents, and teachers
                </>
              )}
              {recipientType === "teachers" && (
                <>
                  <UserCheck className="h-4 w-4 text-[#0d9488]" />
                  Sending to all teachers
                </>
              )}
              {recipientType === "students" && (
                <>
                  <Users className="h-4 w-4 text-[#0d9488]" />
                  Sending to all students
                </>
              )}
              {recipientType === "parents" && (
                <>
                  <Users className="h-4 w-4 text-[#0d9488]" />
                  Sending to all parents
                </>
              )}
              {recipientType === "single" && (
                <>
                  <UserCheck className="h-4 w-4 text-[#0d9488]" />
                  Sending to a single recipient
                </>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-message">Message</Label>
                <span className="text-xs text-slate-400">
                  {message.length} / 160 characters
                </span>
              </div>
              <textarea
                id="sms-message"
                placeholder="Type your SMS message here..."
                rows={5}
                maxLength={160}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              <p className="text-xs text-slate-400">
                SMS limited to 160 characters per message.
              </p>
            </div>

            {/* Send Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSend}
                disabled={sending}
                className="bg-[#0d9488] hover:bg-teal-700 text-white shadow-sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Send SMS"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
