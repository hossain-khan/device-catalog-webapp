import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp } from "@phosphor-icons/react";
import { scrollToTop } from "@/lib/deviceUtils";

export const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      variant="outline"
      size="icon"
      className="fixed bottom-6 right-6 z-40 h-10 w-10 rounded-xl bg-card/90 backdrop-blur-md border-border/80 shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
      aria-label="Back to top"
    >
      <ArrowUp size={16} />
    </Button>
  );
};
