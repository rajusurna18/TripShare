import { useState, useEffect } from "react";

function ReadingProgress() {
  const [scrollWidth, setScrollWidth] = useState(0);

  const calculateScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const percentage = (window.scrollY / totalHeight) * 100;
      setScrollWidth(percentage);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", calculateScroll);
    return () => window.removeEventListener("scroll", calculateScroll);
  }, []);

  return (
    <div
      className="position-fixed top-0 start-0 w-100"
      style={{
        height: "4px",
        zIndex: 1050, // Above normal header navigation
        background: "rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="h-100 bg-warning transition-all"
        style={{
          width: `${scrollWidth}%`,
          boxShadow: "0 0 10px #ffc107, 0 0 5px #ffc107",
          transition: "width 0.1s ease-out",
        }}
      />
    </div>
  );
}

export default ReadingProgress;
