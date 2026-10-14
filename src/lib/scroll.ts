/**
 * Ultra-smooth scrolling utility with cinematic cubic easing curve
 * Handles adaptive duration, cancel on user touch/wheel, and offset calculation
 */

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let activeScrollAnimation: number | null = null;

export function smoothScrollTo(
  target: number | string,
  offset = 80,
  customDuration?: number
): void {
  if (typeof window === "undefined") return;

  let endY = 0;
  if (typeof target === "string") {
    if (target.startsWith("#")) {
      const el = document.querySelector(target);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      endY = window.scrollY + rect.top - offset;
    } else {
      const el = document.getElementById(target);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      endY = window.scrollY + rect.top - offset;
    }
  } else {
    endY = target;
  }

  // Ensure target is within document bounds
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  endY = Math.max(0, Math.min(endY, maxScroll));

  const startY = window.scrollY;
  const distance = Math.abs(endY - startY);

  // If already at or very close to target, finish immediately
  if (distance < 3) {
    window.scrollTo(0, endY);
    return;
  }

  // Cancel any existing active scroll animation
  if (activeScrollAnimation !== null) {
    cancelAnimationFrame(activeScrollAnimation);
    activeScrollAnimation = null;
  }

  // Adaptive duration: smooth glide between 550ms (short) and 900ms (long)
  const duration =
    customDuration ??
    Math.min(900, Math.max(550, Math.sqrt(distance) * 20));
  const startTime = performance.now();

  const cancel = () => {
    if (activeScrollAnimation !== null) {
      cancelAnimationFrame(activeScrollAnimation);
      activeScrollAnimation = null;
    }
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
  };

  // Allow user to naturally interrupt smooth scroll by scrolling or touching
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const easedProgress = easeInOutCubic(progress);

    const currentY = Math.round(startY + (endY - startY) * easedProgress);
    window.scrollTo(0, currentY);

    if (progress < 1) {
      activeScrollAnimation = requestAnimationFrame(step);
    } else {
      activeScrollAnimation = null;
      cleanup();
    }
  };

  activeScrollAnimation = requestAnimationFrame(step);
}
