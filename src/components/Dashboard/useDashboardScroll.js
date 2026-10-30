import { useLayoutEffect, useState } from "react";

const MAIN_PANEL_ID = "main-panel";

export default function useDashboardScroll(threshold = 12) {
  const [isScrolled, setIsScrolled] = useState(false);

  useLayoutEffect(() => {
    const container = document.getElementById(MAIN_PANEL_ID);
    if (!container) return undefined;

    container.scrollTop = 0;
    setIsScrolled(false);

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > threshold);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isScrolled;
}
