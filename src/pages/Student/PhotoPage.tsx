import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Camera, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

import { fetchStudentPhoto, getPhotoBlobUrl, updateStudentPhoto, uploadStudentPhoto, deleteStudentPhoto } from "@/api/student";

export default function PhotoPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!studentId) return;
    setIsLoading(true);
    fetchStudentPhoto(Number(studentId))
      .then(async (data) => {
        if (data?.filePath) {
          const blobUrl = await getPhotoBlobUrl(data.filePath);
          setPhoto(blobUrl);
        }
      })
      .catch(() => { /* no photo yet */ })
      .finally(() => setIsLoading(false));
  }, [studentId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

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
    if (!studentId) {
      toast.error("Student ID is missing");
      return;
    }

    const fileInput = fileInputRef.current;
    const file = fileInput?.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    setIsUploading(true);
    try {
      // Try update first, fall back to upload
      try {
        await updateStudentPhoto(Number(studentId), file);
      } catch {
        await uploadStudentPhoto(Number(studentId), file);
      }
      toast.success("Photo updated successfully");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!studentId) return;
    try {
      await deleteStudentPhoto(Number(studentId));
      setPhoto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Photo deleted successfully");
    } catch {
      toast.error("Failed to delete photo");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/student/profile/${studentId}`)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-teal-600" />
              Student Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6">
              {/* Photo Preview */}
              <div className="relative">
                <Avatar className="h-48 w-48 border-4 border-slate-100 shadow-md">
                  {isLoading ? (
                    <AvatarFallback className="bg-slate-100 text-slate-400">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </AvatarFallback>
                  ) : photo ? (
                    <AvatarImage src={photo} alt="Student photo" className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-slate-100 text-slate-400 text-4xl font-bold">
                      ?
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
              </div>

              {/* Update Button at Bottom */}
              <div className="w-full border-t border-slate-100 pt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/student/profile/${studentId}`)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !photo}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Update Photo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
