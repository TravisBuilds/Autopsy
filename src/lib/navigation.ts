import {
  Activity,
  Dna,
  FlaskConical,
  Home,
  Pill,
  Scan,
  Upload,
  Watch,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const mainNav: NavItem[] = [
  { title: "Command Center", href: "/", icon: Home, description: "Biological snapshot" },
  { title: "Biomarkers", href: "/biomarkers", icon: FlaskConical, description: "Bloodwork trends" },
  { title: "Timeline", href: "/timeline", icon: Activity, description: "Longitudinal view" },
  { title: "Interventions", href: "/interventions", icon: Pill, description: "Supplements & protocols" },
  { title: "Wearables", href: "/wearables", icon: Watch, description: "WHOOP & recovery" },
  { title: "Imaging", href: "/imaging", icon: Scan, description: "MRI & structural" },
  { title: "Genome", href: "/genome", icon: Dna, description: "WGS insights" },
  { title: "Upload", href: "/upload", icon: Upload, description: "Ingest lab reports" },
];
