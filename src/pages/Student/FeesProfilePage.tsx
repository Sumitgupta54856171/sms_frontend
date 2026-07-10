import { useNavigate } from "react-router-dom";
import ViewFees from "@/components/Fees/ViewFees";

export default function FeesProfilePage() {
  const navigate = useNavigate();

  // Read student data from sessionStorage (set before navigation)
  const stored = sessionStorage.getItem("feesStudent");
  let student: any = null;
  try {
    student = stored ? JSON.parse(stored) : null;
  } catch {
    student = null;
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Student data not found. Please go back and select a student.</p>
          <button
            onClick={() => navigate("/fees")}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            Back to Fee Management
          </button>
        </div>
      </div>
    );
  }

  return <ViewFees student={student} onBack={() => navigate("/fees")} />;
}
