export interface SectorTemplate {
  id: string;
  name: string;
  regionFit: string;
  defaultMethod: "FP" | "UCP" | "BOTH";
  suggestedHourlyRate: number;
  riskProfile: "LOW" | "MEDIUM" | "HIGH";
  complianceNeeds: string[];
  estimationAssumptions: string[];
  deliveryRisks: string[];
}

export const sectorTemplates: SectorTemplate[] = [
  {
    id: "GOVERNMENT",
    name: "Government digital service",
    regionFit: "GCC / EU / US public sector",
    defaultMethod: "BOTH",
    suggestedHourlyRate: 85,
    riskProfile: "HIGH",
    complianceNeeds: ["Data residency", "Accessibility", "Audit trail", "Procurement approval"],
    estimationAssumptions: ["Formal acceptance gates", "Integration with legacy systems", "Arabic/English reporting"],
    deliveryRisks: ["Slow approvals", "Changing tender scope", "Security review delays"]
  },
  {
    id: "FINTECH",
    name: "Fintech and payments",
    regionFit: "Global regulated markets",
    defaultMethod: "BOTH",
    suggestedHourlyRate: 110,
    riskProfile: "HIGH",
    complianceNeeds: ["PCI readiness", "KYC/AML controls", "Encryption", "Incident logging"],
    estimationAssumptions: ["High test coverage", "Third-party payment provider", "Role-based operations"],
    deliveryRisks: ["Provider certification", "Fraud edge cases", "Regulatory change"]
  },
  {
    id: "HEALTHCARE",
    name: "Healthcare platform",
    regionFit: "GCC / EU / US healthcare",
    defaultMethod: "BOTH",
    suggestedHourlyRate: 95,
    riskProfile: "HIGH",
    complianceNeeds: ["HIPAA/GDPR alignment", "Consent records", "Protected data handling", "Access audit"],
    estimationAssumptions: ["Sensitive data workflows", "Clinic/admin roles", "Clinical reporting"],
    deliveryRisks: ["Privacy review", "Workflow validation", "Integration data quality"]
  },
  {
    id: "ECOMMERCE",
    name: "E-commerce marketplace",
    regionFit: "MENA / global retail",
    defaultMethod: "FP",
    suggestedHourlyRate: 65,
    riskProfile: "MEDIUM",
    complianceNeeds: ["VAT invoices", "Payment security", "Refund policies", "Inventory audit"],
    estimationAssumptions: ["Catalog, cart, checkout, orders", "Promotions and shipping rules", "Mobile-first UX"],
    deliveryRisks: ["Variant complexity", "Payment gateway differences", "Peak traffic readiness"]
  },
  {
    id: "SAAS",
    name: "B2B SaaS product",
    regionFit: "Global subscription markets",
    defaultMethod: "BOTH",
    suggestedHourlyRate: 90,
    riskProfile: "MEDIUM",
    complianceNeeds: ["Tenant isolation", "Subscription gating", "Usage metering", "Security logging"],
    estimationAssumptions: ["Admin dashboard", "Billing-ready architecture", "Analytics and exports"],
    deliveryRisks: ["Multi-tenant leakage", "Plan entitlement gaps", "Customer onboarding friction"]
  },
  {
    id: "EDUCATION",
    name: "Education and LMS",
    regionFit: "Schools, universities, training centers",
    defaultMethod: "UCP",
    suggestedHourlyRate: 55,
    riskProfile: "MEDIUM",
    complianceNeeds: ["Student privacy", "Role permissions", "Content ownership", "Attendance records"],
    estimationAssumptions: ["Learner, instructor, admin journeys", "Assessment and certificates", "Reporting dashboard"],
    deliveryRisks: ["Content migration", "Academic calendar rules", "Mobile device diversity"]
  },
  {
    id: "LOGISTICS",
    name: "Logistics and field operations",
    regionFit: "Regional transport and delivery",
    defaultMethod: "BOTH",
    suggestedHourlyRate: 75,
    riskProfile: "HIGH",
    complianceNeeds: ["Location data policy", "Driver records", "SLA reporting", "Operations audit"],
    estimationAssumptions: ["Dispatch workflows", "Route/status tracking", "Customer notifications"],
    deliveryRisks: ["Offline edge cases", "Map provider cost", "Real-time update load"]
  },
  {
    id: "ERP_CRM",
    name: "ERP / CRM modernization",
    regionFit: "Mid-market and enterprise",
    defaultMethod: "FP",
    suggestedHourlyRate: 80,
    riskProfile: "HIGH",
    complianceNeeds: ["Access governance", "Data migration audit", "Approval workflows", "Financial controls"],
    estimationAssumptions: ["Entity-heavy business logic", "Reports and imports", "Role-specific dashboards"],
    deliveryRisks: ["Data cleanup", "Legacy process exceptions", "Stakeholder alignment"]
  }
];

export function findSectorTemplate(id?: string): SectorTemplate {
  return sectorTemplates.find((template) => template.id === id) ?? sectorTemplates.find((template) => template.id === "SAAS") ?? sectorTemplates[0];
}
