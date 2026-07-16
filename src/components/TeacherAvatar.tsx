import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchTeacherPhoto, getTeacherPhotoBlobUrl } from "@/api/teacher";

interface TeacherAvatarProps {
  teacherId: number;
  teacherName: string;
  className?: string;
  fallbackClassName?: string;
}

export default function TeacherAvatar({
  teacherId,
  teacherName,
  className = "h-20 w-20",
  fallbackClassName = "bg-teal-100 text-teal-700 text-lg font-semibold",
}: TeacherAvatarProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchTeacherPhoto(teacherId)
      .then(async (data) => {
        if (!cancelled && data?.filePath) {
          const blobUrl = await getTeacherPhotoBlobUrl(data.filePath);
          if (!cancelled) setPhotoUrl(blobUrl);
        }
      })
      .catch(() => { /* no photo */ })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [teacherId]);

  const initials = teacherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={`${className} border-2 border-white shadow-sm`}>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={teacherName} className="object-cover" />
      ) : null}
      <AvatarFallback className={isLoading ? "bg-slate-100 text-slate-400" : fallbackClassName}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
