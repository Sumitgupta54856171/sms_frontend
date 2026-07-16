import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import IDCard from "@/components/IdCard";
import { fetchStudentDetail } from "@/api/student";
import { fetchStudentClassAndRoll } from "@/api/enrollment";

export default function IdCardPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: detailResponse, isLoading: loadingStudent } = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: () => fetchStudentDetail(Number(studentId)),
    enabled: !!studentId,
  });

  const { data: classRollData, isLoading: loadingClassRoll } = useQuery({
    queryKey: ["student-class-roll", studentId],
    queryFn: () => fetchStudentClassAndRoll(Number(studentId)),
    enabled: !!studentId,
  });

  const student = detailResponse?.student ?? null;
  const isLoading = loadingStudent || loadingClassRoll;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Extract class_no and roll_no from the dedicated API response
  const cr = classRollData?.data ?? classRollData ?? {};
  const classNo = cr.class_no ?? cr.classNo ?? cr.class ?? "";
  const rollNo = cr.roll_no ?? cr.rollNo ?? cr.roll ?? "";

  const idCardStudent = student
    ? {
        id: student.id,
        name: student.name,
        father_name: student.father_name,
        mother_name: student.mother_name,
        scholar_no: student.scholar_no,
        classInfo: classNo,
        roll: rollNo,
        phone: student.phone,
        address: student.address,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-lg">
        <button
          onClick={() => navigate(`/student/profile/${studentId}`)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>

        <IDCard student={idCardStudent} />
      </div>
    </div>
  );
}
