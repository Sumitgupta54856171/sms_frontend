import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchStudentPhoto, getPhotoBlobUrl } from "@/api/student";

interface StudentAvatarProps {
  studentId: number;
  studentName: string;
  className?: string;
  fallbackClassName?: string;
}

export default function StudentAvatar({
  studentId,
  studentName,
  className = "h-10 w-10",
  fallbackClassName = "bg-teal-100 text-teal-700 text-xs font-semibold",
}: StudentAvatarProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchStudentPhoto(studentId)
      .then(async (data) => {
        if (!cancelled && data?.filePath) {
          const blobUrl = await getPhotoBlobUrl(data.filePath);
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
  }, [studentId]);

  const initials = studentName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={`${className} border-2 border-white shadow-sm`}>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={studentName} className="object-cover" />
      ) : null}
      <AvatarFallback className={isLoading ? "bg-slate-100 text-slate-400" : fallbackClassName}>
        {initials || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
