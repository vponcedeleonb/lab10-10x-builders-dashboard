import Papa from "papaparse";

export interface ProjectData {
  email: string;
  display_name: string;
  project_title: string;
  project_status: string;
  project_created_at: string;
  project_updated_at: string;
  project_content_text: string;
}

export function parseProjectsCSV(csvText: string): ProjectData[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  return result.data
    .filter((row) => row.email && row.project_title)
    .map((row) => ({
      email: row.email?.trim() ?? "",
      display_name: row.display_name?.trim() ?? "",
      project_title: row.project_title?.trim() ?? "",
      project_status: row.project_status?.trim() ?? "",
      project_created_at: row.project_created_at?.trim() ?? "",
      project_updated_at: row.project_updated_at?.trim() ?? "",
      project_content_text: row.project_content_text?.trim() ?? "",
    }));
}
