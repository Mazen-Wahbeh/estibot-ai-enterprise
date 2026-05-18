import type { Complexity } from "@/types/estimation";

export const complexities: Complexity[] = ["simple", "average", "complex"];

export const fpComponents = [
  {
    key: "externalInputs",
    label: "External Inputs",
    shortLabel: "EI",
    weights: { simple: 3, average: 4, complex: 6 }
  },
  {
    key: "externalOutputs",
    label: "External Outputs",
    shortLabel: "EO",
    weights: { simple: 4, average: 5, complex: 7 }
  },
  {
    key: "externalInquiries",
    label: "External Inquiries",
    shortLabel: "EQ",
    weights: { simple: 3, average: 4, complex: 6 }
  },
  {
    key: "internalLogicalFiles",
    label: "Internal Logical Files",
    shortLabel: "ILF",
    weights: { simple: 7, average: 10, complex: 15 }
  },
  {
    key: "externalInterfaceFiles",
    label: "External Interface Files",
    shortLabel: "EIF",
    weights: { simple: 5, average: 7, complex: 10 }
  }
] as const;

export const fpGscFactors = [
  { id: "dataCommunications", label: "Data communications" },
  { id: "distributedProcessing", label: "Distributed data processing" },
  { id: "performance", label: "Performance objectives" },
  { id: "heavilyUsedConfiguration", label: "Heavily used configuration" },
  { id: "transactionRate", label: "Transaction rate" },
  { id: "onlineDataEntry", label: "Online data entry" },
  { id: "endUserEfficiency", label: "End-user efficiency" },
  { id: "onlineUpdate", label: "Online update" },
  { id: "complexProcessing", label: "Complex processing" },
  { id: "reusability", label: "Reusability" },
  { id: "installationEase", label: "Installation ease" },
  { id: "operationalEase", label: "Operational ease" },
  { id: "multipleSites", label: "Multiple sites" },
  { id: "facilitateChange", label: "Facilitate change" }
] as const;

export const ucpActorWeights = { simple: 1, average: 2, complex: 3 } as const;
export const ucpUseCaseWeights = { simple: 5, average: 10, complex: 15 } as const;

export const ucpTechnicalFactors = [
  { id: "distributedSystem", label: "Distributed system", weight: 2 },
  { id: "performanceObjectives", label: "Performance objectives", weight: 1 },
  { id: "endUserEfficiency", label: "End-user efficiency", weight: 1 },
  { id: "complexProcessing", label: "Complex internal processing", weight: 1 },
  { id: "reusableCode", label: "Reusable code", weight: 1 },
  { id: "easyInstall", label: "Easy to install", weight: 0.5 },
  { id: "easyUse", label: "Easy to use", weight: 0.5 },
  { id: "portable", label: "Portable", weight: 2 },
  { id: "easyChange", label: "Easy to change", weight: 1 },
  { id: "concurrent", label: "Concurrent", weight: 1 },
  { id: "security", label: "Security features", weight: 1 },
  { id: "thirdPartyAccess", label: "Third-party access", weight: 1 },
  { id: "trainingNeeds", label: "Training needs", weight: 1 }
] as const;

export const ucpEnvironmentalFactors = [
  { id: "familiarProcess", label: "Familiar with process", weight: 1.5 },
  { id: "applicationExperience", label: "Application experience", weight: 0.5 },
  { id: "objectOrientedExperience", label: "Object-oriented experience", weight: 1 },
  { id: "leadAnalystCapability", label: "Lead analyst capability", weight: 0.5 },
  { id: "motivation", label: "Team motivation", weight: 1 },
  { id: "stableRequirements", label: "Stable requirements", weight: 2 },
  { id: "partTimeWorkers", label: "Part-time workers", weight: -1 },
  { id: "difficultLanguage", label: "Difficult programming language", weight: -1 }
] as const;
