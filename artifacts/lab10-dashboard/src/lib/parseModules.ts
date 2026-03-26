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
  sortOrder: number;
  completedCount: number;
  inProgressCount: number;
  track: "nocode" | "code";
  completedEmails: string[];
  inProgressEmails: string[];
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

interface CatalogModule {
  track: "nocode" | "code";
  week: number;
  sortOrder: number;
  title: string;
}

export function parseCatalog(catalogCsv: string): CatalogModule[] {
  const result = Papa.parse<Record<string, string>>(catalogCsv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data
    .map((row) => {
      const week = parseInt(row.week_number ?? "0", 10);
      const sort = parseInt(row.sort_order ?? "0", 10);
      const lp = (row.learning_path ?? "").trim();
      const title = (row.module_name ?? "").trim();
      const track: "nocode" | "code" = lp.includes("No-Code") ? "nocode" : "code";
      return { track, week, sortOrder: sort, title };
    })
    .filter((m) => m.week >= 1 && m.week <= 3 && m.title);
}

export function computeAggregateModules(
  activityCsv: string,
  companySlug: string,
  emailTrackMap?: Map<string, "nocode" | "code">,
  catalogCsv?: string
): { modules: AggModule[]; totalStudents: number; totalNoCode: number; totalCode: number } {
  const rows = parseRows(activityCsv, companySlug);

  const students = new Set<string>();
  const activityMap = new Map<
    string,
    { completed: Set<string>; inProgress: Set<string> }
  >();

  for (const row of rows) {
    const week = parseInt(row.week_number ?? "0", 10);
    if (week < 1 || week > 3) continue;
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email) continue;
    students.add(email);
    const title = (row.module_title ?? "").trim();
    const key = `${week}::${title}`;
    if (!activityMap.has(key)) {
      activityMap.set(key, { completed: new Set(), inProgress: new Set() });
    }
    const entry = activityMap.get(key)!;
    const status = (row.module_status ?? "").trim().toLowerCase();
    if (status === "completed") entry.completed.add(email);
    else if (status === "in_progress") entry.inProgress.add(email);
  }

  let totalNoCode = 0;
  let totalCode = 0;
  for (const email of students) {
    const track = emailTrackMap?.get(email);
    if (track === "code") totalCode++;
    else totalNoCode++;
  }

  let catalogModules: CatalogModule[] = [];
  if (catalogCsv) {
    catalogModules = parseCatalog(catalogCsv);
  }

  const modules: AggModule[] = catalogModules.map((cat) => {
    const key = `${cat.week}::${cat.title}`;
    const activity = activityMap.get(key);
    return {
      title: cat.title,
      week: cat.week,
      sortOrder: cat.sortOrder,
      track: cat.track,
      completedCount: activity?.completed.size ?? 0,
      inProgressCount: activity?.inProgress.size ?? 0,
      completedEmails: activity ? [...activity.completed] : [],
      inProgressEmails: activity ? [...activity.inProgress] : [],
    };
  });

  if (modules.length === 0) {
    for (const [key, activity] of activityMap) {
      const [weekStr, title] = key.split("::");
      const week = parseInt(weekStr, 10);
      modules.push({
        title,
        week,
        sortOrder: 0,
        track: "nocode",
        completedCount: activity.completed.size,
        inProgressCount: activity.inProgress.size,
        completedEmails: [...activity.completed],
        inProgressEmails: [...activity.inProgress],
      });
    }
  }

  modules.sort((a, b) => a.week - b.week || a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  return { modules, totalStudents: students.size, totalNoCode, totalCode };
}
