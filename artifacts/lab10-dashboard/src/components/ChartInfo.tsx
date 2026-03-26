import { useState } from "react";
import { Info } from "lucide-react";

interface Props {
  text: string;
}

export default function ChartInfo({ text }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center ml-1.5"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <Info className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500 transition-colors cursor-default" />
      {visible && (
        <div
          className="absolute z-50 left-5 top-0 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed pointer-events-none"
          style={{ fontFamily: "inherit" }}
        >
          {text}
          <span
            className="absolute -left-1.5 top-2 w-3 h-3 bg-gray-900 rotate-45"
            style={{ clipPath: "polygon(0 0, 0% 100%, 100% 50%)" }}
          />
        </div>
      )}
    </span>
  );
}
