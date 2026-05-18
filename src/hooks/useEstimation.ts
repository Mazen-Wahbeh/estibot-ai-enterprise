import { useContext } from "react";
import { EstimationContext } from "@/state/EstimationContext";

export function useEstimation() {
  const context = useContext(EstimationContext);
  if (!context) {
    throw new Error("useEstimation must be used inside EstimationProvider.");
  }
  return context;
}
