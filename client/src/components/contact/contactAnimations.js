export const EASE = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } }
};

export const staggerParent = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export const viewportOnce = { once: true, margin: "0px" };

export const WORD_VARIANTS = {
  hidden: { opacity: 0, y: 50, rotateX: -40 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 1.2, ease: EASE } }
};
