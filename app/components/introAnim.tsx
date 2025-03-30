import { Star } from "lucide-react";
import { motion } from "motion/react";
import NumberTicker from "./ui/basic-number-ticker";
import { Link } from "@remix-run/react";

interface IntroProps {
  booksCount?: number;
  pages?: number;
  averageRating?: number;
  shortUrl?: string;
}

export default function IntroAnim({
  booksCount = 0,
  pages = 0,
  averageRating = 0,
  shortUrl = "",
}: IntroProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <motion.div
      animate={{ x: 0 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="text-lg text-center md:text-4xl font-bold md:text-right p-4"
    >
      <h2>
        <Link to={shortUrl}>readingwrapped.co{shortUrl}</Link>
      </h2>
      <motion.h4
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 0.5 }}
        className="text-lg md:text-2xl font-normal"
      >
        Your 2024 reading year in review
      </motion.h4>
      <motion.h3
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 1 }}
        className="text-md md:text-3xl font-normal my-3"
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
        className="text-md md:text-3xl font-normal my-3"
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
      <motion.h3
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 1.5 }}
        className="text-md md:text-3xl font-normal my-3 flex items-center justify-center gap-1"
      >
        Average Rating:&nbsp;
        <div className="flex">
          {stars.map((star, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                bounce: 0.4,
                delay: 1.5 + index * 0.1,
              }}
            >
              <motion.div
                transition={{ type: "spring" }}
                whileHover={{ scale: 1.2, rotate: 360 }}
              >
                <Star
                  className={`w-3 h-3 md:w-6 md:h-6 ${
                    star <= averageRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.h3>
    </motion.div>
  );
}
