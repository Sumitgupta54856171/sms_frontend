import React, { useEffect, useRef, useState } from "react";
import {
  Settings,
  User,
  Mail,
  MessageSquare,
  Camera,
  Save,
  Loader2,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  fetchAdminProfile,
  updateAdminProfile,
  uploadAdminPhoto,
  fetchSmsSettings,
  saveSmsSettings,
  fetchEmailSettings,
  saveEmailSettings,
  type AdminProfile,
  type SmsGatewaySettings,
  type EmailSettings,
} from "@/api/settings";

export default function SettingsView() {
  const user = useAppSelector((s) => s.auth.user);
  const userRole = user?.role ?? "";
  const normalizedRole = userRole.replace(/^ROLE_/i, "").toLowerCase();
  const isSuperAdmin = normalizedRole === "super_admin" || normalizedRole === "superadmin";

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AdminProfile>({
    name: "",
    email: "",
    phone: "",
    photoUrl: "",
  });

  const [sms, setSms] = useState<SmsGatewaySettings>({
    gatewayUrl: "",
    apiKey: "",
    senderId: "",
    enabled: false,
  });

  const [email, setEmail] = useState<EmailSettings>({
    gmailAddress: "",
    gmailAppSecret: "",
    enabled: false,
  });

  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoading(true);
    Promise.all([fetchAdminProfile(), fetchSmsSettings(), fetchEmailSettings()])
      .then(([p, s, e]) => {
        setProfile(p);
        setSms(s);
        setEmail(e);
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
        <div className="mx-auto max-w-3xl">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                This settings page is restricted to Super Admins only. Please contact your administrator if you need access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadAdminPhoto(file);
      setProfile((p) => ({ ...p, photoUrl: url }));
      toast.success("Profile photo updated");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateAdminProfile(profile);
      toast.success("Profile saved successfully");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSms = async () => {
    setSaving(true);
    try {
      await saveSmsSettings(sms);
      toast.success("SMS gateway settings saved");
    } catch {
      toast.error("Failed to save SMS settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      await saveEmailSettings(email);
      toast.success("Gmail settings saved");
    } catch {
      toast.error("Failed to save email settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
                <Settings className="h-3.5 w-3.5" />
                System Configuration
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Super Admin Settings
              </h1>
              <p className="text-base text-slate-500 mt-2 leading-relaxed">
                Manage your profile, SMS gateway, and Gmail credentials for system notifications.
              </p>
            </div>
            <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 px-3 py-1.5 text-xs font-medium">
              Role: Super Admin
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm font-medium text-slate-600">Loading settings...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200 p-1 mb-6">
              <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="sms" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS Gateway
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <Mail className="h-4 w-4 mr-2" />
                Gmail SMTP
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    Admin Profile
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and profile photo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative group">
                      <Avatar className="h-28 w-28 border-4 border-slate-100 cursor-pointer" onClick={handlePhotoClick}>
                        <AvatarImage src={profile.photoUrl} alt={profile.name} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-semibold">
                          {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={handlePhotoClick}
                        className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </div>
                    <div className="flex-1 w-full space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="admin-name">Full Name</Label>
                          <Input
                            id="admin-name"
                            value={profile.name}
                            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Super Admin Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin-email">Email Address</Label>
                          <Input
                            id="admin-email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                            placeholder="admin@school.edu"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 sm:w-1/2">
                        <Label htmlFor="admin-phone">Phone Number</Label>
                        <Input
                          id="admin-phone"
                          value={profile.phone}
                          onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SMS Gateway Tab */}
            <TabsContent value="sms" className="mt-0">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                    </div>
                    SMS Gateway
                  </CardTitle>
                  <CardDescription>
                    Configure the SMS provider used for sending notifications to parents and staff.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sms-url">Gateway URL</Label>
                      <Input
                        id="sms-url"
                        value={sms.gatewayUrl}
                        onChange={(e) => setSms((s) => ({ ...s, gatewayUrl: e.target.value }))}
                        placeholder="https://api.smsprovider.com/v1/send"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sms-sender">Sender ID</Label>
                      <Input
                        id="sms-sender"
                        value={sms.senderId}
                        onChange={(e) => setSms((s) => ({ ...s, senderId: e.target.value }))}
                        placeholder="SCHLMS"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="sms-api-key">API Key</Label>
                      <Input
                        id="sms-api-key"
                        value={sms.apiKey}
                        onChange={(e) => setSms((s) => ({ ...s, apiKey: e.target.value }))}
                        placeholder="Enter your SMS API key"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-enabled" className="text-sm font-medium">Enable SMS Gateway</Label>
                      <p className="text-xs text-slate-500">Turn on to send SMS notifications from the system.</p>
                    </div>
                    <Switch
                      id="sms-enabled"
                      checked={sms.enabled}
                      onCheckedChange={(checked) => setSms((s) => ({ ...s, enabled: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveSms}
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save SMS Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gmail SMTP Tab */}
            <TabsContent value="email" className="mt-0">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-1.5 bg-rose-100 rounded-lg">
                      <Mail className="h-4 w-4 text-rose-600" />
                    </div>
                    Gmail SMTP
                  </CardTitle>
                  <CardDescription>
                    Set the Gmail address and app password used to send system emails.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gmail-address">Gmail Address</Label>
                      <Input
                        id="gmail-address"
                        type="email"
                        value={email.gmailAddress}
                        onChange={(e) => setEmail((x) => ({ ...x, gmailAddress: e.target.value }))}
                        placeholder="school@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gmail-secret">Gmail App Password / Secret</Label>
                      <div className="relative">
                        <Input
                          id="gmail-secret"
                          type={showSecret ? "text" : "password"}
                          value={email.gmailAppSecret}
                          onChange={(e) => setEmail((x) => ({ ...x, gmailAppSecret: e.target.value }))}
                          placeholder="xxxx xxxx xxxx xxxx"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-enabled" className="text-sm font-medium">Enable Gmail SMTP</Label>
                      <p className="text-xs text-slate-500">Turn on to send emails through the configured Gmail account.</p>
                    </div>
                    <Switch
                      id="email-enabled"
                      checked={email.enabled}
                      onCheckedChange={(checked) => setEmail((x) => ({ ...x, enabled: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveEmail}
                      disabled={saving}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Gmail Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
