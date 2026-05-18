import { resolveMarker } from "@/lib/ingestion/marker-catalog";
import type { BiomarkerCategory } from "@/types/health";

interface DescriptionEntry {
  match: RegExp[];
  description: string;
}

const DESCRIPTIONS: DescriptionEntry[] = [
  {
    match: [/^ldl\b/i, /ldl cholesterol/i],
    description:
      "Low-density lipoprotein — often called “bad” cholesterol. Carries cholesterol to arteries; higher levels are linked to cardiovascular risk.",
  },
  {
    match: [/^hdl\b/i, /hdl cholesterol/i],
    description:
      "High-density lipoprotein — often called “good” cholesterol. Helps clear cholesterol from the bloodstream.",
  },
  {
    match: [/total cholesterol/i, /^cholesterol$/i],
    description: "Sum of cholesterol carried in your blood, including LDL, HDL, and other fractions.",
  },
  {
    match: [/non.?hdl/i],
    description:
      "Total cholesterol minus HDL. Reflects atherogenic particles (LDL, VLDL, etc.) in one number.",
  },
  {
    match: [/chol.*hdl|hdl.*ratio/i],
    description: "Ratio of total cholesterol to HDL. Sometimes used as a simple cardiovascular risk signal.",
  },
  {
    match: [/^triglycerides/i, /^tg\b/i],
    description:
      "Blood fat used for energy storage. Often rises after meals, with insulin resistance, or excess alcohol.",
  },
  {
    match: [/^apo\s*b/i, /apolipoprotein\s*b/i],
    description:
      "Protein on LDL and related particles. Some clinicians use it as a direct measure of atherogenic particle load.",
  },
  {
    match: [/^glucose/i, /fasting glucose/i],
    description: "Blood sugar at the time of draw. Reflects short-term glycemic control and metabolism.",
  },
  {
    match: [/^hba1c/i, /hemoglobin a1c/i, /^a1c\b/i],
    description:
      "Average blood sugar over roughly 2–3 months. Shows longer-term glucose exposure on red blood cells.",
  },
  {
    match: [/^insulin/i],
    description:
      "Hormone that moves glucose into cells. Fasting insulin can hint at insulin resistance when interpreted with glucose.",
  },
  {
    match: [/^urate/i, /^uric acid/i],
    description:
      "Breakdown product of purines (from diet and cells). High levels are associated with gout and metabolic stress.",
  },
  {
    match: [/^hscrp/i, /^hs.?crp/i, /^c.?reactive protein/i, /^crp\b/i],
    description:
      "High-sensitivity C-reactive protein — a liver protein that rises with inflammation. Used as a general inflammation marker.",
  },
  {
    match: [/^esr\b/i, /sedimentation rate/i],
    description: "Erythrocyte sedimentation rate — how fast red cells settle. Nonspecific marker of inflammation.",
  },
  {
    match: [/^alt\b/i, /alanine aminotransferase/i],
    description: "Liver enzyme released when liver cells are stressed or injured. Common screen for liver health.",
  },
  {
    match: [/^ast\b/i, /aspartate aminotransferase/i],
    description:
      "Enzyme found in liver and muscle. Can rise with liver injury, muscle damage, or heavy exercise.",
  },
  {
    match: [/^ggt\b/i, /gamma.?glutamyl/i],
    description:
      "Liver enzyme sensitive to bile flow and alcohol. Often checked alongside other liver tests.",
  },
  {
    match: [/^alp\b/i, /alkaline phosphatase/i],
    description:
      "Enzyme from liver, bone, and gut. Elevated levels can reflect bile obstruction, bone turnover, or growth.",
  },
  {
    match: [/^bilirubin/i],
    description:
      "Yellow pigment from broken-down red blood cells. Processed by the liver; high levels can cause jaundice.",
  },
  {
    match: [/^albumin/i],
    description:
      "Main blood protein made by the liver. Reflects liver synthetic function and overall nutritional status.",
  },
  {
    match: [/^wbc\b/i, /white blood cell/i, /leukocytes/i],
    description:
      "White blood cells — immune cells that fight infection. Total count summarizes overall immune activity.",
  },
  {
    match: [/^rbc\b/i, /red blood cell/i, /erythrocytes/i],
    description: "Red blood cells that carry oxygen via hemoglobin. Low counts suggest anemia.",
  },
  {
    match: [/^hemoglobin/i, /^hgb\b/i],
    description: "Iron-containing protein in red cells that transports oxygen throughout the body.",
  },
  {
    match: [/^hematocrit/i, /^hct\b/i],
    description: "Percentage of blood volume made up of red blood cells.",
  },
  {
    match: [/^platelet/i, /^plt\b/i],
    description: "Cell fragments essential for blood clotting and wound healing.",
  },
  {
    match: [/^neutrophil/i],
    description:
      "Most common white blood cell type. First responders to bacterial infection and acute inflammation.",
  },
  {
    match: [/^lymphocyte/i],
    description:
      "White blood cells central to viral immunity and antibody production (B cells, T cells).",
  },
  {
    match: [/^monocyte/i],
    description: "White blood cells that become macrophages and help clear debris and pathogens.",
  },
  {
    match: [/^eosinophil/i],
    description: "White blood cells often elevated with allergies, asthma, or parasitic infections.",
  },
  {
    match: [/^basophil/i],
    description: "Rare white blood cells involved in allergic and inflammatory responses.",
  },
  {
    match: [/^mcv\b/i],
    description: "Mean corpuscular volume — average size of red blood cells. Helps classify anemia types.",
  },
  {
    match: [/^mch\b/i, /^mchc/i],
    description: "Measures hemoglobin amount per red cell (MCH) or concentration (MCHC).",
  },
  {
    match: [/^rdw\b/i],
    description: "Red cell distribution width — variation in red cell size. High RDW can suggest mixed deficiencies.",
  },
  {
    match: [/^ferritin/i],
    description:
      "Stored iron protein. Low suggests depleted iron stores; high can reflect inflammation or iron overload.",
  },
  {
    match: [/^iron\b/i, /serum iron/i],
    description: "Iron circulating bound to transferrin. Interpreted with ferritin and TIBC for iron status.",
  },
  {
    match: [/^tibc/i, /iron binding/i],
    description: "Total iron-binding capacity — how much transferrin is available to carry iron.",
  },
  {
    match: [/transferrin sat/i],
    description: "Percentage of transferrin slots filled with iron. Useful for iron-deficiency workups.",
  },
  {
    match: [/^b12\b/i, /vitamin b12/i, /cobalamin/i],
    description:
      "Vitamin needed for nerve function and DNA synthesis. Deficiency can cause anemia and neuropathy.",
  },
  {
    match: [/^folate/i, /^folic acid/i],
    description: "B vitamin required for cell division and red blood cell production.",
  },
  {
    match: [/^vitamin d/i, /^25.?oh/i, /^25\(oh\)d/i],
    description:
      "25-hydroxyvitamin D — main storage form. Reflects sun exposure, diet, and supplementation.",
  },
  {
    match: [/^creatinine/i],
    description:
      "Waste product from muscle metabolism filtered by the kidneys. Used to estimate kidney function.",
  },
  {
    match: [/^egfr/i, /glomerular filtration/i],
    description:
      "Estimated glomerular filtration rate — calculated kidney filtration capacity from creatinine and demographics.",
  },
  {
    match: [/^bun\b/i, /blood urea nitrogen/i, /^urea\b/i],
    description: "Waste nitrogen from protein breakdown. Rises when kidneys clear less urea or with dehydration.",
  },
  {
    match: [/^sodium/i, /^na\b/i],
    description: "Major blood electrolyte that helps regulate fluid balance and nerve signals.",
  },
  {
    match: [/^potassium/i, /^k\b/i],
    description: "Electrolyte critical for heart rhythm, muscles, and nerves. Tight range matters for safety.",
  },
  {
    match: [/^chloride/i, /^cl\b/i],
    description: "Electrolyte that works with sodium to maintain fluid balance and acid–base status.",
  },
  {
    match: [/^co2\b/i, /bicarbonate/i],
    description: "Blood bicarbonate/CO₂ — helps assess acid–base balance and kidney compensation.",
  },
  {
    match: [/^calcium/i],
    description:
      "Mineral for bones, muscles, and nerves. Total calcium includes protein-bound and free fractions.",
  },
  {
    match: [/^magnesium/i],
    description: "Electrolyte involved in muscle, nerve, and hundreds of enzyme reactions.",
  },
  {
    match: [/^tsh\b/i, /thyroid stimulating/i],
    description:
      "Pituitary hormone that tells the thyroid how much hormone to make. Primary screen for thyroid function.",
  },
  {
    match: [/^free t4/i, /^ft4\b/i, /^t4\b/i],
    description: "Thyroid hormone (thyroxine) that sets metabolic rate. Free T4 is the unbound, active fraction.",
  },
  {
    match: [/^free t3/i, /^ft3\b/i, /^t3\b/i],
    description: "Active thyroid hormone converted from T4. Influences energy, temperature, and heart rate.",
  },
  {
    match: [/^testosterone/i],
    description: "Primary androgen sex hormone. Affects muscle, mood, libido, and red blood cell production.",
  },
  {
    match: [/^estradiol/i, /^estrogen/i],
    description: "Primary estrogen. Important for reproductive health, bones, and cardiovascular risk profile.",
  },
  {
    match: [/^cortisol/i],
    description: "Stress hormone from adrenal glands. Regulates glucose, inflammation, and sleep–wake rhythm.",
  },
  {
    match: [/^psa\b/i],
    description:
      "Prostate-specific antigen — protein from prostate tissue. Used in prostate cancer screening (context-dependent).",
  },
];

const CATEGORY_FALLBACK: Record<BiomarkerCategory, string> = {
  cardiovascular:
    "Blood marker related to lipids, cholesterol transport, or heart disease risk.",
  metabolic: "Marker of blood sugar, metabolism, or related metabolic pathways.",
  liver: "Marker related to liver cells, bile flow, or protein synthesis.",
  hematology: "Blood cell count or component of your complete blood picture.",
  kidney: "Marker of kidney filtration or waste handling.",
  inflammation: "Marker that can rise with inflammation or immune activation.",
  hormones: "Hormone level reflecting endocrine gland function.",
  vitamins: "Vitamin or mineral status marker from your blood panel.",
};

export function getBiomarkerDescription(markerName: string): string | null {
  const trimmed = markerName.trim();
  for (const { match, description } of DESCRIPTIONS) {
    if (match.some((rx) => rx.test(trimmed))) return description;
  }
  return null;
}

export function getBiomarkerDescriptionOrFallback(markerName: string): string {
  return (
    getBiomarkerDescription(markerName) ??
    CATEGORY_FALLBACK[resolveMarker(markerName).category]
  );
}
