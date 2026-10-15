/**
 * Robust smooth scrolling utility for all devices (Mobile, Tablet, Desktop)
 * Uses native hardware-accelerated smooth scrolling with precise offset calculation
 */

export function smoothScrollTo(target: number | string, offset = 80): void {
  if (typeof window === "undefined") return;

  if (target === 0 || target === "top") {
    try {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      window.scrollTo(0, 0);
    }
    return;
  }

  let endY = 0;
  let targetEl: HTMLElement | null = null;

  if (typeof target === "string") {
    const cleanId = target.replace(/^#/, "");
    targetEl =
      document.getElementById(cleanId) ||
      document.querySelector<HTMLElement>(target);

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      endY = Math.round(window.scrollY + rect.top - offset);
    } else {
      return;
    }
  } else {
    endY = Math.round(target);
  }

  // Ensure scroll target stays within valid document scroll bounds
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  endY = Math.max(0, Math.min(endY, maxScroll));

  try {
    window.scrollTo({
      top: endY,
      behavior: "smooth",
    });
  } catch {
    if (targetEl && typeof targetEl.scrollIntoView === "function") {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo(0, endY);
    }
  }
}
