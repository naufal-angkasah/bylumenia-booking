/**
 * Cinematic smooth scrolling utility with custom Ease-In-Out-Quart animation.
 * Delivers buttery smooth, luxurious scrolling on all devices (Mobile, Tablet, Desktop).
 */

// Active animation frame tracker to cleanly cancel previous running scrolls
let activeScrollAnimationId: number | null = null;

// Easing function: Ease-In-Out-Quart (gentle start, silky glide, soft deceleration)
function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function smoothScrollTo(
  target: number | string,
  offset = 80,
  customDuration?: number
): void {
  if (typeof window === "undefined") return;

  // Cancel any ongoing smooth scroll animation
  if (activeScrollAnimationId !== null) {
    cancelAnimationFrame(activeScrollAnimationId);
    activeScrollAnimationId = null;
  }

  // Check if user prefers reduced motion
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let endY = 0;
  let targetEl: HTMLElement | null = null;

  if (target === 0 || target === "top") {
    endY = 0;
  } else if (typeof target === "string") {
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
  const startY = window.scrollY;
  const distance = endY - startY;

  // If already at target position, no animation needed
  if (Math.abs(distance) < 2) {
    return;
  }

  if (prefersReducedMotion) {
    window.scrollTo(0, endY);
    return;
  }

  // Adaptive duration: 750ms for short distance up to 1050ms for long distance
  const duration =
    customDuration ||
    Math.min(1050, Math.max(750, Math.round(Math.abs(distance) * 0.5)));

  let startTime: number | null = null;
  const prevScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";

  // Clean-up handler if user interrupts by touching screen or scrolling
  const cancelEvents = ["wheel", "touchstart", "touchmove", "keydown"];
  const handleUserInterrupt = () => {
    if (activeScrollAnimationId !== null) {
      cancelAnimationFrame(activeScrollAnimationId);
      activeScrollAnimationId = null;
    }
    cleanup();
  };

  const cleanup = () => {
    cancelEvents.forEach((ev) =>
      window.removeEventListener(ev, handleUserInterrupt)
    );
    document.documentElement.style.scrollBehavior = prevScrollBehavior;
  };

  cancelEvents.forEach((ev) =>
    window.addEventListener(ev, handleUserInterrupt, { passive: true })
  );

  function step(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutQuart(progress);

    window.scrollTo(0, Math.round(startY + distance * easedProgress));

    if (progress < 1) {
      activeScrollAnimationId = requestAnimationFrame(step);
    } else {
      activeScrollAnimationId = null;
      cleanup();
    }
  }

  activeScrollAnimationId = requestAnimationFrame(step);
}
