// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });

  mainNav.querySelectorAll('a').forEach(link => {
    const parentLi = link.closest('li.has-dropdown');
    const isTopLevelDropdownLink = parentLi && link.parentElement === parentLi;

    link.addEventListener('click', (e) => {
      // On small screens, tapping the "Get Involved" label opens its
      // submenu instead of jumping straight to the page section.
      if (isTopLevelDropdownLink && window.innerWidth <= 860) {
        e.preventDefault();
        parentLi.classList.toggle('open-sub');
        return;
      }
      mainNav.classList.remove('open');
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Scroll-reveal animations
const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
if ('IntersectionObserver' in window && revealTargets.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => observer.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('in-view'));
}

// Submits a form to FormSubmit's AJAX endpoint and swaps in an inline
// success/error state instead of leaving the page. Shared by every
// form on the site that follows the .form-card markup pattern.
function setupAjaxForm(formId, submitBtnId, errorId, successId, sendingLabel, idleLabel) {
  const form = document.getElementById(formId);
  if (!form) return;

  const submitBtn = document.getElementById(submitBtnId);
  const errorEl = document.getElementById(errorId);
  const successEl = document.getElementById(successId);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = sendingLabel;

    try {
      const timeout = AbortSignal.timeout(12000);
      const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        signal: timeout
      });
      if (!res.ok) throw new Error('Request failed');

      form.hidden = true;
      successEl.hidden = false;
    } catch (err) {
      errorEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = idleLabel;
    }
  });
}

// Partnership interest form
const partnerForm = document.getElementById('partnerForm');
if (partnerForm) {
  // "Other" organisation type reveals a free-text field
  const typeSelect = document.getElementById('partnerType');
  const otherField = document.getElementById('otherTypeField');
  const otherInput = document.getElementById('partnerTypeOther');
  typeSelect.addEventListener('change', () => {
    const isOther = typeSelect.value === 'Other';
    otherField.hidden = !isOther;
    if (otherInput) otherInput.required = isOther;
  });

  setupAjaxForm('partnerForm', 'partnerFormSubmit', 'partnerFormError', 'partnerFormSuccess', 'Sending...', 'Send Interest Form');
}

// Volunteer sign-up form
const volunteerForm = document.getElementById('volunteerForm');
if (volunteerForm) {
  // Shows the skills blurb for whichever department is selected
  const deptSelect = document.getElementById('volDept');
  const deptHelp = document.getElementById('volDeptHelp');
  deptSelect.addEventListener('change', () => {
    const option = deptSelect.options[deptSelect.selectedIndex];
    deptHelp.textContent = option.dataset.skills || '';
  });

  setupAjaxForm('volunteerForm', 'volunteerFormSubmit', 'volunteerFormError', 'volunteerFormSuccess', 'Signing up...', 'Sign Up to Volunteer');
}

// Homepage contact form
setupAjaxForm('contactForm', 'contactFormSubmit', 'contactFormError', 'contactFormSuccess', 'Sending...', 'Send Message');

// Copy-to-clipboard for bank account details
document.querySelectorAll('.bank-copy-btn').forEach(btn => {
  const originalLabel = btn.innerHTML;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = originalLabel;
      }, 1800);
    } catch (err) {
      // Clipboard API unavailable — fall back to a text selection the user can copy manually
      const range = document.createRange();
      const acctEl = document.getElementById('bankAcctNum');
      if (acctEl) {
        range.selectNode(acctEl);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      }
    }
  });
});

// Moments carousel
const galleryTrack = document.getElementById('galleryTrack');
if (galleryTrack) {
  const slides = Array.from(galleryTrack.children);
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const dotsWrap = document.getElementById('galleryDots');

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => {
      slides[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function setActiveDot() {
    const trackCenter = galleryTrack.scrollLeft + galleryTrack.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs((slide.offsetLeft + slide.offsetWidth / 2) - trackCenter);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === closest));
  }

  let scrollTimer;
  galleryTrack.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(setActiveDot, 80);
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    galleryTrack.scrollBy({ left: -(slides[0].offsetWidth + 20), behavior: 'smooth' });
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    galleryTrack.scrollBy({ left: slides[0].offsetWidth + 20, behavior: 'smooth' });
  });

  setActiveDot();
}
