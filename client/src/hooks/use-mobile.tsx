import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Add safety checks for window object
    if (typeof window === 'undefined') return;
    
    try {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        if (window.innerWidth !== undefined) {
          setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }
      }
      mql.addEventListener("change", onChange)
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      return () => mql.removeEventListener("change", onChange)
    } catch (error) {
      console.warn("Error in useIsMobile hook:", error);
      setIsMobile(false);
    }
  }, [])

  return !!isMobile
}
