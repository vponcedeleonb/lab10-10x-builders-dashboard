import { useState, useCallback } from "react";
import type { StudentWithMeta } from "./types";
import { parseCSV } from "./parseStudents";

export function useDashboard() {
  const [students, setStudents] = useState<StudentWithMeta[]>([]);
  const [companyName, setCompanyName] = useState<string>("Tributi");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCSV = useCallback((text: string, name?: string) => {
    setLoading(true);
    try {
      const parsed = parseCSV(text);
      setStudents(parsed);
      if (name) setCompanyName(name);
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

  return { students, companyName, loaded, loading, loadCSV, loadFile };
}
