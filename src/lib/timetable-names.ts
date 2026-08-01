/** Normalize API responses from /testName and /examName into string arrays. */
export function parseTimetableNameList(data: unknown): string[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          const name =
            o.examName ??
            o.testName ??
            o.name ??
            o.timetableName ??
            o.exam_name ??
            o.test_name;
          return typeof name === "string" ? name.trim() : "";
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    return parseTimetableNameList(
      o.body ?? o.data ?? o.examNames ?? o.testNames ?? o.names ?? o.result
    );
  }

  return [];
}
