/**
 * Main JavaScript for Erick Chan Portfolio
 * Vanilla TypeScript - No jQuery dependencies
 */

// Header Sticky functionality
function initHeaderSticky(): void {
  const header = document.querySelector('.main-header') as HTMLElement | null;
  const scrollTop = document.querySelector('.scroll-top') as HTMLElement | null;

  if (!header) return;

  function handleScroll(): void {
    const scrollPosition = window.scrollY;

    if (scrollPosition >= 100) {
      header?.classList.add('fixed-header');
      scrollTop?.classList.add('show');
    } else {
      header?.classList.remove('fixed-header');
      scrollTop?.classList.remove('show');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Check initial position
}

// Mobile Menu Toggle
function initMobileMenu(): void {
  const navbarToggle = document.querySelector('.navbar-toggle') as HTMLElement | null;
  const navbarCollapse = document.querySelector('.navbar-collapse') as HTMLElement | null;

  if (!navbarToggle || !navbarCollapse) return;

  navbarToggle.addEventListener('click', () => {
    navbarCollapse.classList.toggle('show');
    navbarToggle.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.main-menu') && navbarCollapse.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
      navbarToggle.classList.remove('active');
    }
  });

  // Close menu when clicking on a link
  const navLinks = navbarCollapse.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navbarCollapse.classList.remove('show');
      navbarToggle.classList.remove('active');
    });
  });
}

// Counter Animation with Intersection Observer
function initCounterAnimation(): void {
  const counterItems = document.querySelectorAll('.counter-text-wrap');

  if (!counterItems.length) return;

  const animateCounter = (element: Element): void => {
    const countText = element.querySelector('.count-text') as HTMLElement | null;
    if (!countText || element.classList.contains('counted')) return;

    const target = parseInt(countText.getAttribute('data-stop') || countText.textContent || '0', 10);
    const duration = parseInt(countText.getAttribute('data-speed') || '2000', 10);
    const startTime = performance.now();
    const startValue = 0;

    element.classList.add('counted');

    function updateCounter(currentTime: number): void {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuad(progress));

      if (countText) {
        countText.textContent = currentValue.toString();
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else if (countText) {
        countText.textContent = target.toString();
      }
    }

    requestAnimationFrame(updateCounter);
  };

  // Easing function for smooth animation
  function easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counterItems.forEach((item) => observer.observe(item));
}

// Scroll to Top functionality
function initScrollToTop(): void {
  const scrollTopBtn = document.querySelector('.scroll-top') as HTMLElement | null;

  if (!scrollTopBtn) return;

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

// Preloader
function initPreloader(): void {
  const preloader = document.querySelector('.preloader') as HTMLElement | null;

  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 200);
  });
}

// AOS-like animations using Intersection Observer
function initScrollAnimations(): void {
  const animatedElements = document.querySelectorAll('[data-aos]');

  if (!animatedElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const delay = element.getAttribute('data-aos-delay') || '0';

          setTimeout(() => {
            element.classList.add('aos-animate');
          }, parseInt(delay, 10));

          observer.unobserve(element);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  animatedElements.forEach((element) => {
    element.classList.add('aos-init');
    observer.observe(element);
  });
}

// Initialize all functions when DOM is ready
function init(): void {
  initPreloader();
  initHeaderSticky();
  initMobileMenu();
  initCounterAnimation();
  initScrollToTop();
  initScrollAnimations();
}

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential module usage
export { init, initHeaderSticky, initMobileMenu, initCounterAnimation, initScrollToTop };
