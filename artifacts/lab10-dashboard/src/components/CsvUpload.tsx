import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
}

export default function CsvUpload({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      onFile(file);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
        dragging
          ? "border-[#EDF25F] bg-[#EDF25F]/5"
          : "border-border hover:border-[#EDF25F]/50 hover:bg-muted/20"
      }`}
    >
      <Upload className="w-8 h-8 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          Arrastra un archivo CSV aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Soporta el formato de exportación de LAB10
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
