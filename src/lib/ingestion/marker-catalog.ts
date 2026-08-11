import type { BiomarkerCategory } from "@/types/health";

export interface MarkerDefinition {
  canonical: string;
  category: BiomarkerCategory;
  aliases: RegExp[];
}

export const MARKER_CATALOG: MarkerDefinition[] = [
  {
    canonical: "LDL Cholesterol",
    category: "cardiovascular",
    aliases: [/^ldl\b/i, /low.?density lipoprotein/i],
  },
  {
    canonical: "HDL Cholesterol",
    category: "cardiovascular",
    aliases: [/^hdl\b/i, /high.?density lipoprotein/i],
  },
  {
    canonical: "Total Cholesterol",
    category: "cardiovascular",
    aliases: [/^total cholesterol/i, /^cholesterol,?\s*total/i, /^cholesterol$/i],
  },
  {
    canonical: "Triglycerides",
    category: "cardiovascular",
    aliases: [/^triglycerides/i, /^tg\b/i],
  },
  {
    canonical: "ApoB",
    category: "cardiovascular",
    aliases: [/^apo\s*b/i, /apolipoprotein\s*b/i],
  },
  {
    canonical: "Non-HDL Cholesterol",
    category: "cardiovascular",
    aliases: [/^non hdl cholesterol/i, /^non-hdl/i],
  },
  {
    canonical: "Chol/HDL Ratio",
    category: "cardiovascular",
    aliases: [/chol\/hdl/i, /risk ratio/i],
  },
  {
    canonical: "Total Protein",
    category: "metabolic",
    aliases: [/^total protein/i],
  },
  {
    canonical: "ACR",
    category: "kidney",
    aliases: [/^acr\b/i, /microalbumin\/creatinine/i, /albumin\/creatinine ratio/i],
  },
  {
    canonical: "Urine Creatinine",
    category: "kidney",
    aliases: [/^urine creatinine/i],
  },
  {
    canonical: "Glucose",
    category: "metabolic",
    aliases: [/^glucose/i, /^glucose fasting/i, /^fasting glucose/i, /^blood sugar/i],
  },
  {
    canonical: "HbA1c",
    category: "metabolic",
    aliases: [/^hemoglobin a1c/i, /^hba1c/i, /^a1c\b/i],
  },
  {
    canonical: "Urate",
    category: "metabolic",
    aliases: [/^urate/i, /^uric acid/i],
  },
  {
    canonical: "ALT",
    category: "liver",
    aliases: [/^alt\b/i, /alanine aminotransferase/i],
  },
  {
    canonical: "GGT",
    category: "liver",
    aliases: [/^ggt\b/i, /^gamma gt\b/i, /gamma.?glutamyl/i],
  },
  {
    canonical: "Bilirubin",
    category: "liver",
    aliases: [/^bilirubin/i, /^total bilirubin/i],
  },
  {
    canonical: "WBC",
    category: "hematology",
    aliases: [/^wbc\b/i, /white blood cell/i, /leukocytes/i],
  },
  {
    canonical: "Neutrophils",
    category: "hematology",
    aliases: [/^neutrophils/i, /^neutrophil/i],
  },
  {
    canonical: "Ferritin",
    category: "hematology",
    aliases: [/^ferritin/i],
  },
  {
    canonical: "Vitamin B12",
    category: "vitamins",
    aliases: [/^b12\b/i, /vitamin b12/i, /cobalamin/i],
  },
  {
    canonical: "Creatinine",
    category: "kidney",
    aliases: [/^creatinine/i],
  },
  {
    canonical: "eGFR",
    category: "kidney",
    aliases: [/^egfr/i, /estimated glomerular/i],
  },
  {
    canonical: "hsCRP",
    category: "inflammation",
    aliases: [/^hscrp/i, /^hs.?crp/i, /high.?sensitivity c/i],
  },
  {
    canonical: "TSH",
    category: "hormones",
    aliases: [/^tsh\b/i, /thyroid stimulating/i],
  },
  {
    canonical: "Free T4",
    category: "hormones",
    aliases: [/^free t4/i, /^ft4\b/i],
  },
  {
    canonical: "Vitamin D",
    category: "vitamins",
    aliases: [/^vitamin d/i, /^25.?oh vitamin d/i, /^25\(oh\)d/i],
  },
];

export function resolveMarker(name: string): { canonical: string; category: BiomarkerCategory } {
  const trimmed = name.trim();
  for (const def of MARKER_CATALOG) {
    if (def.aliases.some((rx) => rx.test(trimmed))) {
      return { canonical: def.canonical, category: def.category };
    }
  }
  return {
    canonical: trimmed.replace(/\s+/g, " "),
    category: inferCategoryFromName(trimmed),
  };
}

function inferCategoryFromName(name: string): BiomarkerCategory {
  const n = name.toLowerCase();
  if (/cholesterol|ldl|hdl|triglyceride|apo/i.test(n)) return "cardiovascular";
  if (/glucose|a1c|urate|insulin/i.test(n)) return "metabolic";
  if (/alt|ggt|bilirubin|ast|alp/i.test(n)) return "liver";
  if (/wbc|rbc|hemoglobin|hematocrit|platelet|neutrophil|lymph|ferritin|b12/i.test(n)) return "hematology";
  if (/creatinine|egfr|bun|urine/i.test(n)) return "kidney";
  if (/crp|esr|inflammation/i.test(n)) return "inflammation";
  if (/tsh|t3|t4|testosterone|estradiol|cortisol/i.test(n)) return "hormones";
  if (/vitamin|folate|magnesium|zinc/i.test(n)) return "vitamins";
  return "metabolic";
}

export function slugifyMarker(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
