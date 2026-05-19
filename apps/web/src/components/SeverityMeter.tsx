import { motion } from "framer-motion";
import type { Severity } from "@hpm/shared";
import { SEVERITY_META, SEVERITY_ORDER } from "../severity.js";

interface Props {
  severity: Severity;
  pulse?: boolean;
}

export function SeverityMeter({ severity, pulse = false }: Props) {
  const activeIndex = SEVERITY_ORDER.indexOf(severity);
  return (
    <div
      role="meter"
      aria-label={`Password strength: ${SEVERITY_META[severity].label}`}
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuenow={activeIndex}
      className="flex w-full gap-1.5"
    >
      {SEVERITY_ORDER.map((s, i) => {
        const meta = SEVERITY_META[s];
        const isActive = i <= activeIndex;
        const isPulsing = pulse && i === activeIndex;
        return (
          <motion.div
            key={s}
            className={`h-3 flex-1 rounded-full ${isActive ? meta.bar : "bg-zinc-800"}`}
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{
              opacity: 1,
              scaleX: 1,
              boxShadow: isPulsing ? "0 0 16px 2px currentColor" : "none",
            }}
            transition={{
              duration: 0.4,
              delay: i * 0.08,
              repeat: isPulsing ? 2 : 0,
              repeatType: "reverse",
            }}
            style={{ transformOrigin: "left" }}
          />
        );
      })}
    </div>
  );
}
