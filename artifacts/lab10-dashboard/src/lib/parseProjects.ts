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

const COMPANY_LABEL: Record<string, string> = {
  bacu:    "Baco",
  mono:    "Mono",
  skalo:   "Skalo",
  tributi: "Tributi",
  truora:  "Truora",
};

function mapRow(row: Record<string, string>): ProjectData {
  return {
    email: row.email?.trim() ?? "",
    display_name: row.display_name?.trim() ?? "",
    project_title: row.project_title?.trim() ?? "",
    project_status: row.project_status?.trim() ?? "",
    project_created_at: row.project_created_at?.trim() ?? "",
    project_updated_at: row.project_updated_at?.trim() ?? "",
    project_content_text: row.project_content_text?.trim() ?? "",
  };
}

/** Parse all projects from the combined projects.csv, no filtering. */
export function parseProjectsCSV(csvText: string): ProjectData[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data.filter((row) => row.email && row.project_title).map(mapRow);
}

/** Parse the combined projects.csv, returning only rows for the given company slug. */
export function parseProjectsForCompany(csvText: string, companySlug: string): ProjectData[] {
  const label = COMPANY_LABEL[companySlug.toLowerCase()] ?? companySlug;
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data
    .filter((row) => (row.company ?? "").trim() === label && row.email && row.project_title)
    .map(mapRow);
}
