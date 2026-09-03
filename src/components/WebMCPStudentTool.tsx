import { useEffect, useRef, useState } from "react";
import { searchStudents } from "@/api/student";

type StudentRecord = {
  id: number;
  name: string;
  class: string;
  attendance: string;
  feeStatus: string;
  rollNo: string;
};

export default function WebMCPStudentTool() {
  const [studentRecord, setStudentRecord] = useState<StudentRecord | null>(null);
  const registeredRef = useRef(false);

  useEffect(() => {
    const modelContext = window.document?.modelContext;

    if (!modelContext || typeof modelContext.registerTool !== "function") {
      console.warn("WebMCP modelContext is not available in this browser.");
      return;
    }

    if (registeredRef.current) return;
    registeredRef.current = true;

    modelContext.registerTool({
      name: "search_student_records",
      inputSchema: {
        type: "object",
        properties: {
          search_query: {
            type: "string",
            description: "Student name or roll number to search for.",
          },
        },
        required: ["search_query"],
      },
      execute: async ({ search_query }) => {
        const normalizedQuery = search_query.trim().toLowerCase();
        if (!normalizedQuery) {
          return { success: false, error: "Please provide a student name or roll number." };
        }

        const [student] = await searchStudents(normalizedQuery);
        if (!student) {
          return { success: false, error: `No student found for "${search_query}".` };
        }

        const record: StudentRecord = {
          id: student.id,
          name: student.name,
          class: student.classInfo ?? "N/A",
          attendance: "N/A",
          feeStatus: student.status ?? "N/A",
          rollNo: student.roll ?? "N/A",
        };

        setStudentRecord(record);

        return {
          success: true,
          data: record,
        };
      },
    });
  }, []);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">Student record lookup</h2>

      {studentRecord ? (
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-medium">Name:</span> {studentRecord.name}
          </p>
          <p>
            <span className="font-medium">Class:</span> {studentRecord.class}
          </p>
          <p>
            <span className="font-medium">Attendance:</span> {studentRecord.attendance}%
          </p>
          <p>
            <span className="font-medium">Fee Status:</span> {studentRecord.feeStatus}
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Waiting for an AI agent to query the student record tool.
        </p>
      )}
    </div>
  );
}
