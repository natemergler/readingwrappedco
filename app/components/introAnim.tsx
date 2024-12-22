import { Link } from "lucide-react";
import { motion } from "motion/react";

interface IntroProps {
  subtitle?: string;
}

export default function IntroAnim({ subtitle = "Wow, books book books" }: IntroProps) {
  return (
    <motion.div
      animate={{ x: 300 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="text-4xl font-bold"
    >
      <h2>readingwrapped.co</h2>
      <motion.h4
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 0.5 }}
        className="text-2xl font-normal"
      >
        Your reading year in review
      </motion.h4>
      <motion.h3
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 1 }}
        className="text-3xl font-normal my-10"
        
      >
        {subtitle}
      </motion.h3>
    </motion.div>
  );
}
