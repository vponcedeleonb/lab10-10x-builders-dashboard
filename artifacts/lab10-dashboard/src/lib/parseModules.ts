import Papa from "papaparse";

export interface ModuleStats {
  completedW3: number;
  inProgressW3: number;
}

export interface ModuleEntry {
  title: string;
  week: number;
  status: "completed" | "in_progress";
}

export interface AggModule {
  title: string;
  week: number;
  completedCount: number;
  inProgressCount: number;
  track: "nocode" | "code" | "both";
}

const COMPANY_CSV_NAME: Record<string, string> = {
  bacu:    "Baco",
  mono:    "Mono",
  skalo:   "Skalo",
  tributi: "Tributi",
  truora:  "Truora",
};

function parseRows(csvText: string, companySlug: string) {
  const csvCompany = COMPANY_CSV_NAME[companySlug.toLowerCase()] ?? companySlug;
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data.filter(
    (row) => (row.company ?? "").trim() === csvCompany
  );
}

export function computeModuleStats(
  csvText: string,
  companySlug: string
): Map<string, ModuleStats> {
  const rows = parseRows(csvText, companySlug);
  const map = new Map<string, ModuleStats>();

  for (const row of rows) {
    const week = parseInt(row.week_number ?? "0", 10);
    if (week < 1 || week > 3) continue;
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email) continue;
    if (!map.has(email)) map.set(email, { completedW3: 0, inProgressW3: 0 });
    const stats = map.get(email)!;
    const status = (row.module_status ?? "").trim().toLowerCase();
    if (status === "completed") stats.completedW3 += 1;
    else if (status === "in_progress") stats.inProgressW3 += 1;
  }
  return map;
}

export function computeStudentModules(
  csvText: string,
  companySlug: string
): Map<string, ModuleEntry[]> {
  const rows = parseRows(csvText, companySlug);
  const map = new Map<string, ModuleEntry[]>();

  for (const row of rows) {
    const week = parseInt(row.week_number ?? "0", 10);
    if (week < 1 || week > 3) continue;
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email) continue;
    const status = (row.module_status ?? "").trim().toLowerCase();
    if (status !== "completed" && status !== "in_progress") continue;
    if (!map.has(email)) map.set(email, []);
    map.get(email)!.push({
      title: (row.module_title ?? "").trim(),
      week,
      status: status as "completed" | "in_progress",
    });
  }
  return map;
}

export function computeAggregateModules(
  csvText: string,
  companySlug: string,
  emailTrackMap?: Map<string, "nocode" | "code">
): { modules: AggModule[]; totalStudents: number; totalNoCode: number; totalCode: number } {
  const rows = parseRows(csvText, companySlug);
  const students = new Set<string>();
  const moduleMap = new Map<
    string,
    {
      week: number;
      title: string;
      completed: Set<string>;
      inProgress: Set<string>;
      noCodeStudents: Set<string>;
      codeStudents: Set<string>;
    }
  >();

  for (const row of rows) {
    const week = parseInt(row.week_number ?? "0", 10);
    if (week < 1 || week > 3) continue;
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email) continue;
    students.add(email);
    const title = (row.module_title ?? "").trim();
    const key = `${week}::${title}`;
    if (!moduleMap.has(key)) {
      moduleMap.set(key, {
        week,
        title,
        completed: new Set(),
        inProgress: new Set(),
        noCodeStudents: new Set(),
        codeStudents: new Set(),
      });
    }
    const entry = moduleMap.get(key)!;
    const status = (row.module_status ?? "").trim().toLowerCase();
    if (status === "completed") entry.completed.add(email);
    else if (status === "in_progress") entry.inProgress.add(email);

    const track = emailTrackMap?.get(email);
    if (track === "code") entry.codeStudents.add(email);
    else entry.noCodeStudents.add(email);
  }

  let totalNoCode = 0;
  let totalCode = 0;
  for (const email of students) {
    const track = emailTrackMap?.get(email);
    if (track === "code") totalCode++;
    else totalNoCode++;
  }

  const modules: AggModule[] = [];
  for (const [, entry] of moduleMap) {
    const hasNoCode = entry.noCodeStudents.size > 0;
    const hasCode = entry.codeStudents.size > 0;
    let track: "nocode" | "code" | "both" = "both";
    if (emailTrackMap && emailTrackMap.size > 0) {
      if (hasNoCode && hasCode) track = "both";
      else if (hasCode) track = "code";
      else track = "nocode";
    }
    modules.push({
      title: entry.title,
      week: entry.week,
      completedCount: entry.completed.size,
      inProgressCount: entry.inProgress.size,
      track,
    });
  }
  modules.sort((a, b) => a.week - b.week || a.title.localeCompare(b.title));
  return { modules, totalStudents: students.size, totalNoCode, totalCode };
}
