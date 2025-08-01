import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp } from "@phosphor-icons/react";
import { scrollToTop } from "@/lib/deviceUtils";

export const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size="sm"
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
      aria-label="Back to top"
    >
      <ArrowUp size={16} />
    </Button>
  );
};