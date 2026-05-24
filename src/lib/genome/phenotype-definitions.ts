const PHENOTYPE_DEFINITIONS: Record<string, string> = {
  "serotonin transporter activity increased/decreased":
    "Changes in how the SLC6A4 gene regulates serotonin reuptake, which may affect mood regulation, stress response, and related neurological traits.",
  "prb3m(null)":
    "A rare PRB3 gene variant affecting proline-rich protein B3, a salivary protein. Clinical significance is still being characterized in databases.",
  "hypercholesterolemia familial 1":
    "Inherited high LDL cholesterol caused by variants that impair cholesterol clearance from the bloodstream.",
  "familial hypercholesterolemia":
    "A genetic disorder causing very high LDL cholesterol from birth, raising long-term cardiovascular risk if untreated.",
  "homozygous familial hypercholesterolemia":
    "Two copies of a high-impact cholesterol variant, often causing severe LDL elevation and early heart disease.",
  "cardiovascular phenotype":
    "A broad label for genetic effects on heart and blood vessel structure or function.",
  "renal tubular epithelial cell apoptosis":
    "Increased programmed cell death in kidney tubule lining cells, which may reflect kidney stress or genetic susceptibility.",
  "neutrophil inclusion bodies":
    "Abnormal material inside neutrophils (a type of white blood cell), sometimes linked to inflammation or inherited blood disorders.",
  "joubert syndrome 17":
    "A rare brain development disorder affecting the cerebellum, often causing coordination problems and sometimes kidney or eye issues.",
  "cplane1-related condition":
    "A genetic condition linked to CPLANE1, often involving ciliary function and developmental abnormalities.",
  "spina bifida susceptibility to":
    "Genetic factors that may increase susceptibility to spina bifida, a neural tube defect affecting the spine.",
  "coronary artery disease modifier of":
    "A variant that may change how strongly other genetic or environmental factors influence coronary artery disease risk.",
  "coronary artery disease development of in hiv":
    "Reported association with coronary artery disease risk specifically in people living with HIV.",
  "mycobacterium tuberculosis susceptibility to":
    "Genetic factors that may influence susceptibility to tuberculosis infection or disease severity.",
  "lung carcinoma":
    "Malignant cancer originating in lung tissue. Reported associations reflect genetic risk modifiers, not a diagnosis.",
  "benzene toxicity susceptibility to":
    "Genetic variation that may affect how the body handles benzene exposure and related toxic injury risk.",
  "leukemia post-chemotherapy susceptibility to":
    "Increased genetic susceptibility to leukemia that may develop after certain chemotherapy exposures.",
  "breast cancer post-chemotherapy poor survival in":
    "Variant reported to correlate with worse survival outcomes after chemotherapy in breast cancer.",
  "acquired immunodeficiency syndrome slow progression to":
    "Genetic factors that may slow progression from HIV infection to AIDS.",
  "acquired immunodeficiency syndrome delayed progression to":
    "Genetic factors that may delay HIV disease progression toward AIDS.",
  "atopy resistance to":
    "Genetic pattern that may reduce susceptibility to allergic conditions such as eczema, asthma, or hay fever.",
  "normophosphatemic familial tumoral calcinosis":
    "Inherited disorder causing calcium deposits in soft tissues despite normal blood phosphate levels.",
  "myeloproliferative neoplasm unclassifiable":
    "A blood cell disorder with overproduction of blood cells that does not fit a standard classification.",
  "primary ciliary dyskinesia 3":
    "Inherited disorder of motile cilia causing chronic lung, sinus, and sometimes fertility problems.",
  "complement component 7 deficiency":
    "Low or absent complement C7 protein, part of the immune system, increasing susceptibility to certain infections.",
  "ccr5 promoter polymorphism":
    "A common variant near the CCR5 gene that may influence HIV entry into cells and immune response.",
  "susceptibility to hiv infection":
    "Genetic factors that may influence likelihood or course of HIV infection.",
  "gilbert syndrome":
    "A usually benign condition causing mild unconjugated hyperbilirubinemia, sometimes visible as intermittent jaundice.",
  "gilbert syndrome susceptibility to":
    "Genetic susceptibility to Gilbert syndrome, a mild bilirubin processing condition.",
  "deficiency of butyrylcholinesterase":
    "Reduced butyrylcholinesterase enzyme activity, which can prolong effects of certain anesthetics and drugs.",
  "butyrylcholinesterase activity":
    "Variation affecting butyrylcholinesterase enzyme levels, relevant to medication and anesthesia response.",
  "maturity onset diabetes mellitus in young":
    "MODY: a monogenic form of diabetes usually diagnosed before age 25, distinct from type 1 or type 2 diabetes.",
  "maturity-onset diabetes of the young type 3":
    "MODY type 3, usually caused by HNF1A variants, leading to impaired insulin secretion and elevated glucose.",
  "type ii diabetes mellitus":
    "Adult-onset diabetes characterized by insulin resistance and elevated blood sugar.",
  "insulin resistance susceptibility to":
    "Genetic factors that may reduce insulin sensitivity and increase type 2 diabetes risk.",
  "nonpapillary renal cell carcinoma":
    "A subtype of kidney cancer arising from renal tubular cells.",
  "serum hdl cholesterol level modifier of":
    "Variant that may shift HDL cholesterol levels without necessarily causing disease on its own.",
  "gastrointestinal stroma tumor":
    "GIST: a tumor of the digestive tract wall, often linked to growth-signaling gene variants such as PDGFRA.",
  "hereditary cancer-predisposing syndrome":
    "An inherited pattern of gene variants that increases lifetime risk for one or more cancers.",
  "idiopathic hypereosinophilic syndrome":
    "Condition with persistently high eosinophils in blood, which can damage organs over time.",
  "abnormal brain morphology":
    "Structural differences in brain development or anatomy reported in association with this variant.",
  "galactosylceramide beta-galactosidase deficiency":
    "Krabbe disease spectrum: deficiency of galactocerebrosidase, affecting myelin and neurological function.",
  "citrullinemia type i":
    "Urea cycle disorder causing ammonia buildup and elevated citrulline, often presenting in infancy.",
  "citrullinemia type ii":
    "Adult-onset citrin deficiency causing elevated citrulline, often with liver and metabolic symptoms.",
  "citrullinemia type ii adult-onset":
    "Later-onset form of citrin deficiency with metabolic and liver-related symptoms.",
  "late-onset citrullinemia":
    "Citrulline metabolism disorder presenting later in life, often linked to citrin/SLC25A13 variants.",
  "citrin deficiency":
    "Inherited defect in citrin transport affecting urea cycle and energy metabolism, especially during illness.",
  "neonatal intrahepatic cholestasis due to citrin deficiency":
    "Newborn liver cholestasis caused by citrin deficiency, often resolving but requiring monitoring.",
  "classic congenital adrenal hyperplasia due to 21-hydroxylase deficiency":
    "Severe CYP21A2-related adrenal enzyme deficiency affecting cortisol and androgen production.",
  "cystinuria":
    "Inherited kidney disorder causing high cystine in urine and recurrent kidney stones.",
  "vitamin d-dependent rickets type ii with alopecia":
    "Rare form of rickets with impaired vitamin D response and often hair loss.",
  "ugt1a1-related condition":
    "Condition related to bilirubin processing through the UGT1A1 enzyme pathway.",
  "crigler-najjar syndrome type i":
    "Severe unconjugated hyperbilirubinemia from birth due to profound UGT1A1 deficiency.",
  "crigler-najjar syndrome type ii":
    "Partial UGT1A1 deficiency causing significant but usually less severe hyperbilirubinemia.",
  "bilirubin serum level of quantitative trait locus 1":
    "Common genetic influence on baseline bilirubin levels in blood tests.",
  "lucey-driscoll syndrome":
    "Transient familial neonatal hyperbilirubinemia due to bilirubin processing issues in newborns.",
  "irinotecan response":
    "Pharmacogenetic association affecting how the body processes irinotecan, a chemotherapy drug.",
  "increased cold tolerance":
    "Trait associated with improved tolerance to cold exposure, linked to muscle fiber composition.",
  "actinin alpha-3 polymorphism":
    "Common ACTN3 variant affecting fast-twitch muscle fibers and athletic performance traits.",
  "actn3 deficiency":
    "Absence or reduction of alpha-actinin-3 in muscle, associated with endurance-oriented muscle profile.",
  "sprinting performance":
    "Genetic association with explosive power and sprint-oriented athletic performance.",
};

const SKIP_PHENOTYPES = new Set(["not provided", "not specified"]);

function normalizeKey(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isDisplayablePhenotype(label: string): boolean {
  return !SKIP_PHENOTYPES.has(normalizeKey(label));
}

export function titleCasePhenotype(label: string): string {
  const cleaned = label.trim();
  if (/^[A-Z0-9()]+$/.test(cleaned.replace(/\s/g, ""))) {
    return cleaned;
  }
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

function fallbackDefinition(label: string): string {
  const lower = normalizeKey(label);

  if (lower.includes("susceptibility")) {
    return "Genetic variant reported to influence how susceptible you may be to this condition or exposure. This is not a diagnosis.";
  }
  if (lower.includes("modifier")) {
    return "Genetic variant reported to modify the effect of other risk factors rather than cause disease on its own.";
  }
  if (lower.includes("polymorphism")) {
    return "A common genetic variant with reported associations in clinical databases. Effects are often context-dependent.";
  }
  if (lower.includes("deficiency")) {
    return "Genetic variant associated with reduced function of a gene or protein involved in this condition.";
  }
  if (lower.includes("syndrome")) {
    return "A recognized pattern of signs and symptoms associated with variants in this gene pathway.";
  }
  if (lower.includes("response") || lower.includes("toxicity")) {
    return "Pharmacogenetic or exposure-related association describing how your body may respond to a drug or toxin.";
  }
  if (lower.includes("cancer") || lower.includes("carcinoma") || lower.includes("tumor") || lower.includes("neoplasm")) {
    return "Reported association with cancer risk or tumor biology. This reflects genetic predisposition research, not a cancer diagnosis.";
  }

  return "Clinically reported genetic association from your genome import. Interpret alongside updated clinical databases and your care team.";
}

export function getPhenotypeDefinition(label: string): string {
  const key = normalizeKey(label);
  return PHENOTYPE_DEFINITIONS[key] ?? fallbackDefinition(label);
}

export function describePhenotypes(phenotypes: string[]) {
  return phenotypes.filter(isDisplayablePhenotype).map((label) => ({
    label: titleCasePhenotype(label),
    definition: getPhenotypeDefinition(label),
  }));
}

export function primaryPhenotypeLabel(phenotypes: string[]): string {
  const displayable = phenotypes.filter(isDisplayablePhenotype);
  if (displayable.length === 0) return "Reported variant association";
  return titleCasePhenotype(displayable[0]);
}

export function riskDomainLabel(domain: string): string {
  return domain
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function estimatedRiskPercentile(importanceScore: number): number {
  const mean = 50;
  const std = 15;
  const z = (importanceScore - mean) / std;
  const percentile = 0.5 * (1 + erf(z / Math.SQRT2));
  return Math.min(99.9, Math.max(0.1, percentile * 100));
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const abs = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * abs);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-abs * abs));
  return sign * y;
}

export function riskZoneLabel(percentile: number): string {
  if (percentile >= 75) return "Higher than most reference profiles";
  if (percentile >= 40) return "Moderate relative to reference profiles";
  return "Lower than most reference profiles";
}
