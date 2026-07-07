import apiClient from "./client";

export interface Subject {
  name: string;
  code: string;
  type: "main" | "elective" | "additional";
}

export interface SubjectGroup {
  classRange: string;
  classes: string[];
  subjects: Subject[];
}

// ─── Subject definitions by class range ────────────────────────────────
export const SUBJECT_GROUPS: SubjectGroup[] = [
  {
    classRange: "Nursery - UKG",
    classes: ["Nursery", "LKG", "UKG"],
    subjects: [
      { name: "Hindi", code: "HI", type: "main" },
      { name: "English", code: "EN", type: "main" },
      { name: "Maths", code: "MA", type: "main" },
      { name: "Drawing", code: "DR", type: "additional" },
    ],
  },
  {
    classRange: "Grade 1 - 5",
    classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
    subjects: [
      { name: "Hindi", code: "HI", type: "main" },
      { name: "English", code: "EN", type: "main" },
      { name: "Maths", code: "MA", type: "main" },
      { name: "Environment", code: "EV", type: "additional" },
      { name: "Computer", code: "CO", type: "additional" },
    ],
  },
  {
    classRange: "Grade 6 - 8",
    classes: ["Grade 6", "Grade 7", "Grade 8"],
    subjects: [
      { name: "Hindi", code: "HI", type: "main" },
      { name: "English", code: "EN", type: "main" },
      { name: "Maths", code: "MA", type: "main" },
      { name: "Science", code: "SC", type: "main" },
      { name: "Social Studies", code: "SS", type: "main" },
      { name: "Sanskrit", code: "SA", type: "main" },
      { name: "Computer", code: "CO", type: "additional" },
    ],
  },
  {
    classRange: "Grade 9 - 10",
    classes: ["Grade 9", "Grade 10"],
    subjects: [
      { name: "Hindi", code: "HI", type: "main" },
      { name: "English", code: "EN", type: "main" },
      { name: "Maths", code: "MA", type: "main" },
      { name: "Science", code: "SC", type: "main" },
      { name: "Social Studies", code: "SS", type: "main" },
      { name: "Sanskrit", code: "SA", type: "main" },
    ],
  },
  {
    classRange: "Grade 11 - 12",
    classes: ["Grade 11", "Grade 12"],
    subjects: [
      { name: "Hindi (Core)", code: "HI", type: "main" },
      { name: "English (Core)", code: "EN", type: "main" },
    ],
  },
];

// ─── Course-wise subject streams for 11-12 ────────────────────────────
export interface CourseStream {
  name: string;
  subjects: Subject[];
}

export const COURSE_STREAMS: CourseStream[] = [
  {
    name: "Science",
    subjects: [
      { name: "Physics", code: "PHY", type: "main" },
      { name: "Chemistry", code: "CHE", type: "main" },
      { name: "Biology", code: "BIO", type: "main" },
      { name: "Mathematics", code: "MA", type: "main" },
    ],
  },
  {
    name: "Commerce",
    subjects: [
      { name: "Accountancy", code: "ACC", type: "main" },
      { name: "Business Studies", code: "BS", type: "main" },
      { name: "Economics", code: "ECO", type: "main" },
      { name: "Mathematics", code: "MA", type: "main" },
    ],
  },
  {
    name: "Arts",
    subjects: [
      { name: "History", code: "HIS", type: "main" },
      { name: "Political Science", code: "PS", type: "main" },
      { name: "Geography", code: "GEO", type: "main" },
      { name: "Sociology", code: "SOC", type: "main" },
    ],
  },
];

// ─── Helper to get subjects for a class ────────────────────────────────
export const getSubjectsForClass = (className: string): Subject[] => {
  const group = SUBJECT_GROUPS.find((g) => g.classes.includes(className));
  return group?.subjects ?? [];
};

// ─── Fetch subjects from backend (optional, uses local data as fallback) ──
export const fetchSubjects = async (): Promise<any> => {
  try {
    const response = await apiClient.get("/api/v1/subjects", {
      withCredentials: true,
    });
    return response.data;
  } catch {
    // Fallback to local subject definitions
    return SUBJECT_GROUPS;
  }
};
