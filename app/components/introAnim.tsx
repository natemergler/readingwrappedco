
import { motion } from "motion/react";

interface IntroProps {
  subtitle?: string;
}

export default function IntroAnim({ subtitle = "You read a lot" }: IntroProps) {
  return (
      <motion.div
        animate={{ x: 300 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="text-4xl font-bold"
      >
        <h2>Reading Wrapped</h2>
        <motion.h4
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.5 }}
          className="text-2xl font-normal"
        >
          Your reading year in review
        </motion.h4>
        { subtitle }
      </motion.div>
  );
}