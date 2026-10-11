/**
 * DESIGNTERIO PVT. LTD - INTERACTIVE JAVASCRIPT ENGINE
 * Handles: Theme toggle, sticky navigation, before/after slider, budget estimator,
 * portfolio filters & quick view modal, testimonials slider, and consultation bookings.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Theme Toggle (Dark / Light Mode)
  // -------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  
  // Check persisted preference or default to dark
  const currentTheme = localStorage.getItem('designterio_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const targetTheme = activeTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('designterio_theme', targetTheme);
      updateThemeIcon(targetTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
      // Show sun icon to switch to light
      themeIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    } else {
      // Show moon icon to switch to dark
      themeIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    }
  }

  // -------------------------------------------------------------------------
  // 2. Navigation Stickiness, Active Spy & Mobile Menu Drawer
  // -------------------------------------------------------------------------
  const header = document.querySelector('.header');
  const mobileToggle = document.getElementById('mobileToggle');
  const navDrawer = document.getElementById('navDrawer');
  const navBackdrop = document.getElementById('navBackdrop');
  const navCloseBtn = document.getElementById('navCloseBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const drawerLinks = document.querySelectorAll('.drawer-nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Mobile Drawer Helpers
  function openMobileMenu() {
    mobileToggle?.classList.add('active');
    navDrawer?.classList.add('active');
    navBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileToggle?.classList.remove('active');
    navDrawer?.classList.remove('active');
    navBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navDrawer?.classList.contains('active');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (navCloseBtn) {
    navCloseBtn.addEventListener('click', closeMobileMenu);
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeMobileMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Scroll Handling (Stickiness & Active Link Highlight)
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Header sticky backdrop blur
    if (scrollPos > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollPos > 450) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Check if user scrolled to bottom of page
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
    if (atBottom) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#contact');
      });
      return;
    }

    // ScrollSpy active link detection
    let currentActiveId = '';
    sections.forEach(section => {
      const top = section.offsetTop - 110;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        currentActiveId = id;
      }
    });

    if (currentActiveId) {
      navLinks.forEach(link => {
        const targetHref = link.getAttribute('href');
        if (targetHref === `#${currentActiveId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // -------------------------------------------------------------------------
  // 3. Interactive Before & After Transformation Slider
  // -------------------------------------------------------------------------
  const comparisonContainer = document.getElementById('comparisonContainer');
  const afterWrapper = document.getElementById('afterWrapper');
  const sliderHandle = document.getElementById('sliderHandle');

  if (comparisonContainer && afterWrapper && sliderHandle) {
    let isDragging = false;

    const setPosition = (clientX) => {
      const rect = comparisonContainer.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      
      // Constrain between 3% and 97%
      let percentage = (offsetX / rect.width) * 100;
      if (percentage < 3) percentage = 3;
      if (percentage > 97) percentage = 97;

      afterWrapper.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
      sliderHandle.style.left = `${percentage}%`;
    };

    const onStart = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(clientX);
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(clientX);
    };

    const onEnd = () => {
      isDragging = false;
    };

    // Mouse listeners
    comparisonContainer.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    // Touch listeners
    comparisonContainer.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }

  // -------------------------------------------------------------------------
  // 4. Interactive Interior Budget & Timeline Estimator (INR / Indian Rupees)
  // -------------------------------------------------------------------------
  const propertyChips = document.querySelectorAll('[data-estimator-type="property"]');
  const scopeChips = document.querySelectorAll('[data-estimator-type="scope"]');
  const finishChips = document.querySelectorAll('[data-estimator-type="finish"]');
  const areaSlider = document.getElementById('areaSlider');
  const areaDisplay = document.getElementById('areaDisplay');

  const estPriceMin = document.getElementById('estPriceMin');
  const estPriceMax = document.getElementById('estPriceMax');
  const estPriceNumeric = document.getElementById('estPriceNumeric');
  const estTimeline = document.getElementById('estTimeline');
  const estSummaryProperty = document.getElementById('estSummaryProperty');
  const estSummaryScope = document.getElementById('estSummaryScope');
  const estSummaryRate = document.getElementById('estSummaryRate');
  const claimEstimateBtn = document.getElementById('claimEstimateBtn');

  // Helper: Indian Rupee Formatter (Lakhs & Crores)
  function formatINR(val) {
    if (val >= 10000000) {
      const cr = (val / 10000000).toFixed(2);
      return `₹${cr} Cr`;
    } else if (val >= 100000) {
      const lk = (val / 100000).toFixed(1);
      return `₹${lk} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  }

  function formatINRCurrency(val) {
    return '₹' + val.toLocaleString('en-IN');
  }

  // Base state
  let currentSelection = {
    property: '3bhk',
    propertyLabel: '3 BHK Luxury Apartment',
    scope: 'full',
    scopeLabel: 'Complete Turnkey Home',
    finish: 'signature',
    finishLabel: 'Signature Contemporary',
    area: 1650,
    calculatedMin: '₹28.5 Lakhs',
    calculatedMax: '₹34.8 Lakhs',
    calculatedNumeric: '₹28,50,000 - ₹34,80,000'
  };

  // Base rates per square foot in Indian Rupees (INR ₹)
  const finishRates = {
    standard: { base: 1350, label: 'Elegance Essential (₹1,350/sq.ft)' },
    signature: { base: 1950, label: 'Signature Contemporary (₹1,950/sq.ft)' },
    royal: { base: 3100, label: 'Royal Bespoke Atelier (₹3,100/sq.ft)' }
  };

  const scopeMultipliers = {
    kitchen: 0.55,
    living: 0.65,
    full: 1.0,
    luxury: 1.38
  };

  const propertyTimelineBase = {
    '2bhk': 40,
    '3bhk': 55,
    '4bhk': 70,
    'commercial': 50
  };

  function updateEstimator() {
    const area = parseInt(areaSlider ? areaSlider.value : currentSelection.area, 10);
    currentSelection.area = area;
    if (areaDisplay) areaDisplay.textContent = `${area.toLocaleString('en-IN')} sq.ft`;

    const baseRate = finishRates[currentSelection.finish].base;
    const scopeMult = scopeMultipliers[currentSelection.scope];
    
    // Calculate total base cost in Indian Rupees (INR)
    const effectiveRate = Math.round(baseRate * scopeMult);
    const totalMin = Math.round((area * effectiveRate * 0.95) / 10000) * 10000;
    const totalMax = Math.round((area * effectiveRate * 1.15) / 10000) * 10000;

    // Calculate timeline
    let days = propertyTimelineBase[currentSelection.property] || 50;
    if (currentSelection.scope === 'kitchen' || currentSelection.scope === 'living') {
      days = Math.round(days * 0.65);
    } else if (currentSelection.scope === 'luxury') {
      days = Math.round(days * 1.25);
    }

    if (estPriceMin) estPriceMin.textContent = formatINR(totalMin);
    if (estPriceMax) estPriceMax.textContent = formatINR(totalMax);
    if (estPriceNumeric) estPriceNumeric.textContent = `${formatINRCurrency(totalMin)} – ${formatINRCurrency(totalMax)} (Estimated all-inclusive turnkey range)`;
    if (estTimeline) estTimeline.textContent = `${days} - ${days + 15} Days`;
    if (estSummaryProperty) estSummaryProperty.textContent = currentSelection.propertyLabel;
    if (estSummaryScope) estSummaryScope.textContent = currentSelection.scopeLabel;
    if (estSummaryRate) estSummaryRate.textContent = `₹${effectiveRate.toLocaleString('en-IN')} / sq.ft avg`;

    // Cache values for modal prefill
    currentSelection.calculatedMin = formatINR(totalMin);
    currentSelection.calculatedMax = formatINR(totalMax);
    currentSelection.calculatedNumeric = `${formatINRCurrency(totalMin)} - ${formatINRCurrency(totalMax)}`;
  }

  function setupChips(chips, type) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        currentSelection[type] = chip.getAttribute('data-value');
        currentSelection[`${type}Label`] = chip.textContent.trim();
        updateEstimator();
      });
    });
  }

  setupChips(propertyChips, 'property');
  setupChips(scopeChips, 'scope');
  setupChips(finishChips, 'finish');

  if (areaSlider) {
    areaSlider.addEventListener('input', updateEstimator);
  }

  // Initialize estimator output
  updateEstimator();

  // "Claim Estimate" -> prefill consultation form and scroll or open modal
  if (claimEstimateBtn) {
    claimEstimateBtn.addEventListener('click', () => {
      openConsultationModalWithEstimate();
    });
  }

  // -------------------------------------------------------------------------
  // 5. Curated Portfolio Gallery (Filter & Modal Details)
  // -------------------------------------------------------------------------
  const portfolioData = [
    {
      id: 'penthouse',
      category: 'living',
      title: 'The Belgrave Penthouse Suite',
      subtitle: 'Living & Dining Atelier',
      area: '4,800 sq.ft',
      location: 'South Mumbai Skyline',
      timeline: '75 Days',
      materials: 'Calacatta Vagli Marble, Bouclé, Smoked Oak, Fluted Glass',
      image: 'assets/images/hero-penthouse.jpg',
      description: 'A bespoke double-height architectural living salon designed with sweeping skyline vistas, custom linear fireplace surround, suspended lighting sculpture, and organic bouclé lounge seating.'
    },
    {
      id: 'kitchen-chef',
      category: 'kitchen',
      title: 'Florentine Minimalist Kitchen',
      subtitle: 'Modular Architectural Kitchen',
      area: '850 sq.ft',
      location: 'Bandra West, Mumbai',
      timeline: '45 Days',
      materials: 'Smoked Oak Fluting, Mont Blanc Quartzite, Brushed Brass, Blum Servo-Drive',
      image: 'assets/images/project-kitchen.jpg',
      description: 'Sculptural waterfall monolithic island with seamless concealed appliances, fluted timber joinery, integrated ambient brass lighting, and custom walk-in spice pantry.'
    },
    {
      id: 'bedroom-suite',
      category: 'bedroom',
      title: 'Serene Haven Master Suite',
      subtitle: 'Bespoke Residential Bedroom',
      area: '1,200 sq.ft',
      location: 'Worli Sea Face, Mumbai',
      timeline: '40 Days',
      materials: 'Acoustic Fluted Oak, Belgian Linen, Honed Travertine, Custom Walk-in Closet',
      image: 'assets/images/project-bedroom.jpg',
      description: 'An intimate sanctuary crafted with warm earth tones, acoustic slatted headboard wall, arched full-length mirror, recessed cove lighting, and private reading enclave.'
    },
    {
      id: 'commercial-hq',
      category: 'commercial',
      title: 'Zenith Strategic Headquarters',
      subtitle: 'Executive Boardroom & Creative Studio',
      area: '6,500 sq.ft',
      location: 'BKC Financial District',
      timeline: '60 Days',
      materials: 'Acoustic Wood Paneling, Bespoke Terrazzo, Italian Leather, Frameless Glazing',
      image: 'assets/images/project-commercial.jpg',
      description: 'A forward-thinking executive environment uniting refined warmth and state-of-the-art acoustic privacy. Features custom terrazzo conference table and lush biophilic indoor planters.'
    },
    {
      id: 'spa-bath',
      category: 'bathroom',
      title: 'Mineral Oasis Spa Bath',
      subtitle: 'Luxury Master Ensuite',
      area: '420 sq.ft',
      location: 'Juhu Beach Estate',
      timeline: '35 Days',
      materials: 'Monolithic Travertine Stone, Brushed Bronze, Backlit Arch Vanity, Fluted Glass',
      image: 'assets/images/project-bathroom.jpg',
      description: 'A sensory spa retreat featuring a custom hand-carved stone soaking bathtub, floor-to-ceiling honed beige travertine, garden-view glazing, and dual floating vanity.'
    },
    {
      id: 'metamorphosis',
      category: 'living',
      title: 'The Sky-Lounge Transformation',
      subtitle: 'Turnkey Architectural Overhaul',
      area: '3,200 sq.ft',
      location: 'Khar West, Mumbai',
      timeline: '65 Days',
      materials: 'Seamless Microcement, Vertical Slat Joinery, Minimalist Sofa, Flush Pivot Doors',
      image: 'assets/images/after-renovation.jpg',
      description: 'Complete transformation from a cold bare-concrete shell into an ultra-modern skyline residence featuring concealed magnetic doors, museum-grade spotlights, and monolithic marble table.'
    }
  ];

  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (filterCategory === 'all' || itemCat === filterCategory) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Project Quick View Modal
  const projectModal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalProjectImg = document.getElementById('modalProjectImg');
  const modalProjectTag = document.getElementById('modalProjectTag');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectArea = document.getElementById('modalProjectArea');
  const modalProjectLocation = document.getElementById('modalProjectLocation');
  const modalProjectTimeline = document.getElementById('modalProjectTimeline');
  const modalProjectMaterials = document.getElementById('modalProjectMaterials');
  const modalProjectDesc = document.getElementById('modalProjectDesc');

  document.querySelectorAll('.portfolio-quick-view-btn, .portfolio-card-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const parentItem = trigger.closest('.portfolio-item');
      const projectId = parentItem ? parentItem.getAttribute('data-id') : null;
      const project = portfolioData.find(p => p.id === projectId);

      if (project && projectModal) {
        if (modalProjectImg) modalProjectImg.src = project.image;
        if (modalProjectTag) modalProjectTag.textContent = project.subtitle;
        if (modalProjectTitle) modalProjectTitle.textContent = project.title;
        if (modalProjectArea) modalProjectArea.textContent = project.area;
        if (modalProjectLocation) modalProjectLocation.textContent = project.location;
        if (modalProjectTimeline) modalProjectTimeline.textContent = project.timeline;
        if (modalProjectMaterials) modalProjectMaterials.textContent = project.materials;
        if (modalProjectDesc) modalProjectDesc.textContent = project.description;

        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeProjectModal() {
    if (projectModal) {
      projectModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  // -------------------------------------------------------------------------
  // 6. Testimonials Slider
  // -------------------------------------------------------------------------
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('testPrevBtn');
  const nextBtn = document.getElementById('testNextBtn');
  let currentSlide = 0;
  let testimonialInterval;

  function showSlide(index) {
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === index);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

  function startAutoplay() {
    testimonialInterval = setInterval(nextSlide, 7000);
  }

  function resetAutoplay() {
    clearInterval(testimonialInterval);
    startAutoplay();
  }

  if (slides.length > 0) startAutoplay();

  // -------------------------------------------------------------------------
  // 7. Consultation Booking & Toast Notification System
  // -------------------------------------------------------------------------
  const consultationForm = document.getElementById('consultationForm');
  const modalConsultationForm = document.getElementById('modalConsultationForm');
  const consultationModal = document.getElementById('consultationModal');
  const consultModalClose = document.getElementById('consultModalClose');
  const openConsultModalBtns = document.querySelectorAll('.open-consult-modal');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  function showToast(message) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // Open booking modal
  openConsultModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (consultationModal) {
        consultationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeConsultationModal() {
    if (consultationModal) {
      consultationModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (consultModalClose) consultModalClose.addEventListener('click', closeConsultationModal);
  if (consultationModal) {
    consultationModal.addEventListener('click', (e) => {
      if (e.target === consultationModal) closeConsultationModal();
    });
  }

  function openConsultationModalWithEstimate() {
    if (consultationModal) {
      consultationModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      const reqInput = document.getElementById('modalReqInput');
      if (reqInput) {
        reqInput.value = `Estimated Plan: ${currentSelection.propertyLabel} (${currentSelection.area.toLocaleString('en-IN')} sq.ft) with ${currentSelection.scopeLabel} in ${currentSelection.finishLabel} finish. Estimated Turnkey Budget: ${currentSelection.calculatedMin} - ${currentSelection.calculatedMax} (${currentSelection.calculatedNumeric}).`;
      }
    }
  }


  // Form Submission Handler — real Gmail SMTP API
  async function handleFormSubmit(form, isModal = false) {
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.reportValidity()) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalHTML = submitBtn ? submitBtn.innerHTML : '';

      const getValue = (id) =>
        document.getElementById(id)?.value?.trim() || '';

      const payload = {
        type: 'consultation',
        source: isModal ? 'Consultation modal' : 'Contact form',
        name: getValue(isModal ? 'modalName' : 'clientName'),
        phone: getValue(isModal ? 'modalPhone' : 'clientPhone'),
        email: getValue(isModal ? 'modalEmail' : 'clientEmail'),
        propertyType: isModal
          ? ''
          : getValue('clientProperty'),
        area: isModal ? '' : getValue('clientArea'),
        preferredDate: isModal ? '' : getValue('clientDate'),
        message: isModal
          ? getValue('modalReqInput')
          : getValue('clientMessage')
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending enquiry...';
      }

      try {
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || 'Unable to send your enquiry. Please try again.'
          );
        }

        // Open a WhatsApp draft after the server accepts the email.
        const whatsappNumber = '918299481808'; // Confirm this is your number
        const whatsappMessage = [
          'New DESIGNTERIO website enquiry',
          `Name: ${payload.name}`,
          `Phone: ${payload.phone}`,
          `Email: ${payload.email}`,
          payload.propertyType
            ? `Property: ${payload.propertyType}`
            : '',
          payload.area ? `Area: ${payload.area} sq.ft` : '',
          payload.preferredDate
            ? `Preferred date: ${payload.preferredDate}`
            : '',
          `Details: ${payload.message || 'Not provided'}`
        ].filter(Boolean).join('\n');

        const whatsappURL =
          `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        const whatsappWindow = window.open(
          whatsappURL,
          '_blank',
          'noopener,noreferrer'
        );

        form.reset();

        if (isModal) closeConsultationModal();

        showToast(
          'Enquiry emailed successfully. WhatsApp will open so you can send the message.'
        );

      } catch (error) {
        console.error('Enquiry submission failed:', error);
        showToast(
          error.message || 'Could not send your enquiry. Please try again.'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        }
      }
    });
  }

  handleFormSubmit(consultationForm, false);
  handleFormSubmit(modalConsultationForm, true);


  // Newsletter Form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      newsletterForm.reset();
      showToast('Subscribed! Welcome to the Designterio Private Architecture Journal.');
    });
  }

  // Escape key to close any active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeConsultationModal();
    }
  });

});
