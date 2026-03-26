import Papa from "papaparse";

export interface ModuleStats {
  completedW3: number;
  inProgressW3: number;
}

const COMPANY_CSV_NAME: Record<string, string> = {
  bacu:    "Baco",
  mono:    "Mono",
  skalo:   "Skalo",
  tributi: "Tributi",
  truora:  "Truora",
};

export function computeModuleStats(
  csvText: string,
  companySlug: string
): Map<string, ModuleStats> {
  const csvCompany = COMPANY_CSV_NAME[companySlug.toLowerCase()] ?? companySlug;

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const map = new Map<string, ModuleStats>();

  for (const row of result.data) {
    if ((row.company ?? "").trim() !== csvCompany) continue;
    const week = parseInt(row.week_number ?? "0", 10);
    if (week < 1 || week > 3) continue;

    const email = (row.email ?? "").trim().toLowerCase();
    if (!email) continue;

    if (!map.has(email)) map.set(email, { completedW3: 0, inProgressW3: 0 });
    const stats = map.get(email)!;

    const status = (row.module_status ?? "").trim().toLowerCase();
    if (status === "completed") {
      stats.completedW3 += 1;
    } else if (status === "in_progress") {
      stats.inProgressW3 += 1;
    }
  }

  return map;
}
