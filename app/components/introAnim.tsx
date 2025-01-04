import { Link } from "lucide-react";
import { motion } from "motion/react";
import NumberTicker from "./ui/basic-number-ticker";

interface IntroProps {
  booksCount?: number;
  pages?: number;
}

export default function IntroAnim({ booksCount = 0, pages = 0 }: IntroProps) {
  return (
    <motion.div
      animate={{ x: 300 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="text-4xl font-bold text-right"
    >
      <h2>readingwrapped.co</h2>
      <motion.h4
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 0.5 }}
        className="text-2xl font-normal"
      >
        Your 2024 reading year in review
      </motion.h4>
      <motion.h3
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 1 }}
        className="text-3xl font-normal my-10"
      >
        <NumberTicker
          from={0}
          target={booksCount}
          transition={{
            duration: 5,
            type: "tween",
            ease: "linear",
          }}
        ></NumberTicker>
        &nbsp;Books Read
      </motion.h3>
      <motion.h3
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 1 }}
        className="text-3xl font-normal my-10"
      >
        <NumberTicker
          from={0}
          target={pages}
          transition={{
            duration: 5,
            type: "tween",
            ease: "linear",
          }}
        ></NumberTicker>
        &nbsp;Pages Read
      </motion.h3>
    </motion.div>
  );
}
