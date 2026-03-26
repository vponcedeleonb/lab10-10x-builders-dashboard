import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

router.post("/projects/summary", async (req, res) => {
  try {
    const { projects } = req.body as {
      projects: { title: string; student: string; content: string }[];
    };

    if (!Array.isArray(projects) || projects.length === 0) {
      res.status(400).json({ error: "projects array required" });
      return;
    }

    const projectList = projects
      .filter((p) => p.content && p.content.trim().length > 20)
      .map((p, i) => `${i + 1}. "${p.title}" — ${p.student}: ${p.content.slice(0, 600)}`)
      .join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "Eres un analista de programas de formación en IA. Analiza los proyectos de los estudiantes y devuelve un objeto JSON con este esquema exacto:\n{\n  \"categories\": [\n    { \"name\": \"Nombre de categoría\", \"count\": N, \"description\": \"Una oración corta describiendo el tema\", \"examples\": [\"nombre_estudiante1\", \"nombre_estudiante2\"] }\n  ],\n  \"insight\": \"Un párrafo de 2-3 oraciones con las tendencias principales del grupo.\"\n}\nUsa 3-5 categorías temáticas en español. En el campo 'examples' pon únicamente los nombres de los estudiantes que pertenecen a esa categoría (no los títulos de los proyectos). No incluyas nada fuera del JSON.",
        },
        {
          role: "user",
          content: `Aquí están los proyectos de ${projects.length} estudiantes:\n\n${projectList}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw);
    res.json(json);
  } catch (err) {
    console.error("projects/summary error", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

export default router;
