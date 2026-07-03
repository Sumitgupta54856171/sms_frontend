import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UploadPhotoProps {
  studentName?: string;
  studentId?: number;
}

export default function UploadPhoto({ studentName, studentId }: UploadPhotoProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = studentName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!photo) {
      toast.error("Please select a photo first");
      return;
    }

    setIsUploading(true);
    try {
      // TODO: API call to upload photo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Photo uploaded successfully");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Camera className="h-5 w-5 text-teal-600" />
          Upload Photo
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-6">
          {/* Photo Preview */}
          <div className="relative">
            <Avatar className="h-40 w-40 border-4 border-slate-100 shadow-md">
              {photo ? (
                <AvatarImage src={photo} alt="Student photo" className="object-cover" />
              ) : (
                <AvatarFallback className="bg-slate-100 text-slate-400 text-4xl font-bold">
                  {initials || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            {photo && (
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex flex-col items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer gap-2 border-slate-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {photo ? "Change Photo" : "Select Photo"}
              </Button>
            </label>
            <p className="text-xs text-slate-400">
              Supported formats: JPG, PNG, WEBP. Max size: 5MB
            </p>
            {photo && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2 min-w-40"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
