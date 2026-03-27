import { useState, useCallback } from "react";
import type { StudentWithMeta } from "./types";
import { parseCSV, parseStudentsForCompany } from "./parseStudents";
import type { ModuleStats } from "./parseModules";

export function useDashboard() {
  const [students, setStudents] = useState<StudentWithMeta[]>([]);
  const [companyName, setCompanyName] = useState<string>("Tributi");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCSV = useCallback((text: string, name?: string, moduleMap?: Map<string, ModuleStats>) => {
    setLoading(true);
    try {
      const parsed = parseCSV(text, moduleMap);
      setStudents(parsed);
      if (name) setCompanyName(name);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCSVForCompany = useCallback((text: string, companySlug: string, name: string, moduleMap?: Map<string, ModuleStats>) => {
    setLoading(true);
    try {
      const parsed = parseStudentsForCompany(text, companySlug, moduleMap);
      setStudents(parsed);
      setCompanyName(name);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const baseName = file.name.replace(/\.csv$/i, "").replace(/_/g, " ");
        loadCSV(text, baseName);
      };
      reader.readAsText(file);
    },
    [loadCSV]
  );

  return { students, companyName, loaded, loading, loadCSV, loadCSVForCompany, loadFile };
}
