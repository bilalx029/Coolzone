/**
 * DAIKIN AIR CONDITIONING - CORE APPLICATION LOGIC
 * Interactive UI behaviors, simulators, filters, modals, and calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. STICKY NAVBAR SCROLL BEHAVIOR
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 25) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  // 2. MOBILE MENU & SERVICES DROPDOWN TOGGLE
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const servicesDropdownItem = document.querySelector('.nav-item-dropdown');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu on clicking navigation links
    const allNavAnchors = navMenu.querySelectorAll('a');
    allNavAnchors.forEach(link => {
      link.addEventListener('click', (e) => {
        // If clicking a data-page link, let switchPage handle navigation
        if (link.hasAttribute('data-page')) {
          const page = link.getAttribute('data-page');
          if (page) {
            e.preventDefault();
            switchPage(page);
          }
        }
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        if (servicesDropdownItem) servicesDropdownItem.classList.remove('open');
      }
    });
  }

  // 3. SPA PAGE NAVIGATION SYSTEM (Fixed View, No Endless Scrolling)
  function switchPage(pageName) {
    if (!pageName) return;
    const allPages = document.querySelectorAll('.spa-page');
    const targetPage = document.getElementById(`page-${pageName}`);
    if (!targetPage) return;

    // Toggle active class on pages
    allPages.forEach(p => p.classList.remove('active'));
    targetPage.classList.add('active');

    // Update active class on navigation links
    const allNavLinks = document.querySelectorAll('.nav-link[data-page], .ps-link[data-page], .ps-col-heading[data-page], .ps-mega-title[data-page]');
    allNavLinks.forEach(link => {
      if (link.getAttribute('data-page') === pageName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Instantly close and suppress the mega menu so the page is immediately visible
    if (servicesDropdownItem) {
      servicesDropdownItem.classList.remove('open');
      servicesDropdownItem.classList.add('dropdown-suppressed');

      const clearSuppression = () => {
        servicesDropdownItem.classList.remove('dropdown-suppressed');
        servicesDropdownItem.removeEventListener('mouseleave', clearSuppression);
      };
      servicesDropdownItem.addEventListener('mouseleave', clearSuppression);

      setTimeout(() => {
        servicesDropdownItem.classList.remove('dropdown-suppressed');
      }, 500);
    }

    // Scroll to top of the page immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Bind click handlers to all elements with data-page attribute
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      const page = el.getAttribute('data-page');
      if (page) {
        e.preventDefault();
        switchPage(page);
        if (navMenu) navMenu.classList.remove('open');
        if (mobileToggle) mobileToggle.classList.remove('active');
      }
    });
  });

  // Handle URL hash on load (e.g. #products, #services, #faq, #about)
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(`page-${initialHash}`)) {
    switchPage(initialHash);
  }


  // 4. INTERACTIVE TEMPERATURE & COMFORT SIMULATOR
  const tempSlider = document.getElementById('tempSlider');
  const tempLargeVal = document.getElementById('tempLargeVal');
  const tempStatusSub = document.getElementById('tempStatusSub');
  const metricNoise = document.getElementById('metricNoise');
  const metricAirflow = document.getElementById('metricAirflow');
  const metricSavings = document.getElementById('metricSavings');
  const presetBtns = document.querySelectorAll('.preset-btn');

  const updateSimulator = (temp) => {
    if (!tempLargeVal) return;
    const t = parseInt(temp, 10);
    tempLargeVal.textContent = t;

    // Update preset buttons active state
    presetBtns.forEach(btn => {
      if (parseInt(btn.getAttribute('data-temp'), 10) === t) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Dynamic metrics based on temperature setting
    if (t <= 18) {
      tempStatusSub.textContent = 'Maximum Turbo Cooling • Rapid Chill Active';
      metricNoise.textContent = '28 dB(A)';
      metricAirflow.textContent = '12.8 m/s';
      metricSavings.textContent = '35% Eco Savings';
    } else if (t <= 21) {
      tempStatusSub.textContent = 'Comfort Cooling • Fast Stabilization';
      metricNoise.textContent = '24 dB(A)';
      metricAirflow.textContent = '9.5 m/s';
      metricSavings.textContent = '48% Eco Savings';
    } else if (t <= 24) {
      tempStatusSub.textContent = 'Optimal Japanese Coanda Airflow • Recommended Sleep';
      metricNoise.textContent = '19 dB(A)';
      metricAirflow.textContent = '7.2 m/s';
      metricSavings.textContent = '65% Eco Savings';
    } else {
      tempStatusSub.textContent = 'Gentle Ambient Air Filtration • Low Energy Mode';
      metricNoise.textContent = '17 dB(A)';
      metricAirflow.textContent = '5.0 m/s';
      metricSavings.textContent = '72% Eco Savings';
    }
  };

  if (tempSlider) {
    tempSlider.addEventListener('input', (e) => {
      updateSimulator(e.target.value);
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-temp');
        tempSlider.value = val;
        updateSimulator(val);
      });
    });
  }

  // 5. PRODUCTS CAROUSEL / SLIDER CONTROLLER (Slide View - No Vertical Scroll)
  const prodCarouselTrack = document.getElementById('prodCarouselTrack');
  const prodCarouselViewport = document.getElementById('prodCarouselViewport');
  const prodSlidePrev = document.getElementById('prodSlidePrev');
  const prodSlideNext = document.getElementById('prodSlideNext');
  const prodCarouselDots = document.getElementById('prodCarouselDots');
  const prodCurrNum = document.getElementById('prodCurrNum');
  const prodTotalNum = document.getElementById('prodTotalNum');
  const allProductSlides = document.querySelectorAll('.product-card.carousel-slide');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let currentSlideIndex = 0;

  const getVisibleSlidesCount = () => {
    return 1; // Always show 1 product at a time
  };

  const getMaxSlideIndex = () => {
    const count = allProductSlides.length;
    return Math.max(0, count - 1); // step one by one
  };

  const updateCarousel = (animate = true) => {
    if (!prodCarouselTrack || allProductSlides.length === 0) return;

    const maxIndex = getMaxSlideIndex();
    if (currentSlideIndex > maxIndex) currentSlideIndex = maxIndex;
    if (currentSlideIndex < 0) currentSlideIndex = 0;

    const firstSlide = allProductSlides[0];
    if (firstSlide) {
      const slideWidth = prodCarouselViewport ? prodCarouselViewport.offsetWidth : firstSlide.offsetWidth;
      const moveDistance = currentSlideIndex * slideWidth;

      prodCarouselTrack.style.transition = animate ? 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
      prodCarouselTrack.style.transform = `translateX(-${moveDistance}px)`;
    }

    // Update Counter
    if (prodCurrNum) {
      prodCurrNum.textContent = String(currentSlideIndex + 1).padStart(2, '0');
    }
    if (prodTotalNum) {
      prodTotalNum.textContent = String(allProductSlides.length).padStart(2, '0');
    }

    // Update Dots
    if (prodCarouselDots) {
      const dots = prodCarouselDots.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlideIndex);
      });
    }

    // Update Arrow disabled states
    if (prodSlidePrev) {
      prodSlidePrev.disabled = currentSlideIndex === 0;
    }
    if (prodSlideNext) {
      prodSlideNext.disabled = currentSlideIndex >= maxIndex;
    }
  };

  if (prodSlidePrev) {
    prodSlidePrev.addEventListener('click', () => {
      if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updateCarousel();
      }
    });
  }

  if (prodSlideNext) {
    prodSlideNext.addEventListener('click', () => {
      if (currentSlideIndex < getMaxSlideIndex()) {
        currentSlideIndex++;
        updateCarousel();
      }
    });
  }

  // Dots click navigation
  if (prodCarouselDots) {
    const dots = prodCarouselDots.querySelectorAll('.carousel-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetIndex = parseInt(dot.getAttribute('data-slide'), 10);
        currentSlideIndex = Math.min(targetIndex, getMaxSlideIndex());
        updateCarousel();
      });
    });
  }

  // Touch Swipe on mobile & tablet
  let touchStartX = 0;
  let touchEndX = 0;

  if (prodCarouselViewport) {
    prodCarouselViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    prodCarouselViewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchStartX - touchEndX;
      if (Math.abs(swipeDistance) > 45) {
        if (swipeDistance > 0 && currentSlideIndex < getMaxSlideIndex()) {
          currentSlideIndex++;
          updateCarousel();
        } else if (swipeDistance < 0 && currentSlideIndex > 0) {
          currentSlideIndex--;
          updateCarousel();
        }
      }
    }, { passive: true });
  }

  // Keyboard navigation when hovering/focusing viewport
  window.addEventListener('keydown', (e) => {
    const rect = prodCarouselViewport ? prodCarouselViewport.getBoundingClientRect() : null;
    const isVisibleInViewport = rect && (rect.top <= window.innerHeight && rect.bottom >= 0);
    if (!isVisibleInViewport) return;

    if (e.key === 'ArrowRight' && currentSlideIndex < getMaxSlideIndex()) {
      currentSlideIndex++;
      updateCarousel();
    } else if (e.key === 'ArrowLeft' && currentSlideIndex > 0) {
      currentSlideIndex--;
      updateCarousel();
    }
  });

  // Window resize handler
  window.addEventListener('resize', () => {
    updateCarousel(false);
  });

  // Filter Buttons slide targeting
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      if (filterVal === 'all') {
        currentSlideIndex = 0;
        updateCarousel();
      } else {
        allProductSlides.forEach((slide, idx) => {
          if (slide.getAttribute('data-category') === filterVal) {
            currentSlideIndex = Math.min(idx, getMaxSlideIndex());
            updateCarousel();
            slide.style.boxShadow = '0 0 35px rgba(0, 160, 233, 0.7)';
            setTimeout(() => {
              slide.style.boxShadow = '';
            }, 1200);
          }
        });
      }
    });
  });

  // Initial render
  setTimeout(() => updateCarousel(false), 150);

  // 6. PRODUCT SPECIFICATIONS DATA & MODAL
  const productSpecsData = {
    'ftxz-split': {
      title: 'Daikin FTXZ Ururu Sarara Split AC',
      category: 'Premium Inverter Split Unit',
      coolingCapacity: '1.5 Ton (5.0 kW / 18,000 BTU)',
      efficiency: 'A+++ / 5.2 ISEER (Highest in Class)',
      refrigerant: 'Eco-Friendly R-32 (Zero ODP)',
      soundLevel: '19 dB(A) Whisper-Quiet Mode',
      filtration: 'Flash Streamer + Titanium Apatite Filter',
      airThrow: 'Up to 14 meters with 3D Coanda Flow',
      smartIoT: 'Built-in Wi-Fi, Daikin One Cloud & Alexa/Google Voice',
      warranty: '5 Years Comprehensive + 10 Years Compressor'
    },
    'emura-designer': {
      title: 'Daikin Emura Designer Series',
      category: 'Architectural Luxury Edition',
      coolingCapacity: '1.5 Ton & 2.0 Ton Available',
      efficiency: 'A+++ / Red Dot Design Award Winner',
      refrigerant: 'Next-Gen R-32 Refrigerant',
      soundLevel: '19 dB(A) Silent Operation',
      filtration: 'Silver Allergen Removal & Streamer Purification',
      airThrow: 'Intelligent Thermal Thermal Sensor Flow',
      smartIoT: 'Integrated Wi-Fi with Smartphone App Control',
      warranty: '5 Years Comprehensive + 10 Years Compressor'
    },
    'skyair-cassette': {
      title: 'Daikin SkyAir 360° Ceiling Cassette',
      category: 'Luxury Open Living & Commercial',
      coolingCapacity: '2.0 Ton to 4.0 Ton Flexible Options',
      efficiency: 'High-Efficiency Inverter Scroll Compressor',
      refrigerant: 'R-32 High Density',
      soundLevel: '28 dB(A) Low Fan Speed',
      filtration: 'High-Density Long-Life Washable Filter',
      airThrow: '360-Degree Uniform Round Flow Discharge',
      smartIoT: 'Centralized Controller + BACnet/Modbus Ready',
      warranty: '3 Years Comprehensive + 5 Years Compressor'
    },
    'fvxm-tower': {
      title: 'Daikin FVXM Heavy Duty Slim Tower',
      category: 'Floor Standing Luxury Inverter',
      coolingCapacity: '2.5 Ton (8.8 kW Power)',
      efficiency: 'Dual Swing Inverter Engine',
      refrigerant: 'R-32 Eco Balanced',
      soundLevel: '32 dB(A) Balanced Flow',
      filtration: 'Dual Active Carbon + HEPA Grade Streamer',
      airThrow: '16-Meter Long Range Turbo Jet Delivery',
      smartIoT: 'Capacitive Glass Touch Display + Mobile Link',
      warranty: '5 Years Comprehensive + 10 Years Compressor'
    }
  };

  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalContentContainer = document.getElementById('modalDynamicContent');

  const openSpecsModal = (productId) => {
    const data = productSpecsData[productId];
    if (!data || !modalOverlay) return;

    modalContentContainer.innerHTML = `
      <div class="modal-header">
        <span class="product-category-tag">${data.category}</span>
        <h3>${data.title}</h3>
        <p>Comprehensive Japanese engineering specifications & performance ratings</p>
      </div>

      <table class="specs-table">
        <tbody>
          <tr>
            <td>Cooling Capacity</td>
            <td>${data.coolingCapacity}</td>
          </tr>
          <tr>
            <td>Energy Rating & ISEER</td>
            <td><span style="color: #10b981; font-weight:800;">${data.efficiency}</span></td>
          </tr>
          <tr>
            <td>Eco Refrigerant</td>
            <td>${data.refrigerant}</td>
          </tr>
          <tr>
            <td>Noise Level (Indoor)</td>
            <td>${data.soundLevel}</td>
          </tr>
          <tr>
            <td>Air Purification</td>
            <td>${data.filtration}</td>
          </tr>
          <tr>
            <td>Air Throw Distribution</td>
            <td>${data.airThrow}</td>
          </tr>
          <tr>
            <td>Smart Connectivity</td>
            <td>${data.smartIoT}</td>
          </tr>
          <tr>
            <td>Official Warranty</td>
            <td>${data.warranty}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 1.8rem; display: flex; gap: 1rem;">
        <button class="btn btn-primary" style="flex:1;" onclick="openQuoteModal('${data.title}')">
          Request Best Price & Installation
        </button>
        <button class="btn btn-outline" onclick="closeAllModals()">
          Close
        </button>
      </div>
    `;

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  // Wire up view spec buttons
  document.querySelectorAll('.btn-view-specs').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-product-id');
      openSpecsModal(prodId);
    });
  });

  // 7. QUOTE & CONSULTATION MODAL
  const quoteModalOverlay = document.getElementById('quoteModalOverlay');
  const quoteProductInput = document.getElementById('quoteProductModel');

  window.openQuoteModal = (modelName = '') => {
    closeAllModals();
    if (quoteProductInput && modelName) {
      quoteProductInput.value = modelName;
    }
    if (quoteModalOverlay) {
      quoteModalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeAllModals = () => {
    if (modalOverlay) modalOverlay.classList.remove('open');
    if (quoteModalOverlay) quoteModalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Close buttons & background clicks
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeAllModals);
  const quoteCloseBtn = document.getElementById('quoteModalCloseBtn');
  if (quoteCloseBtn) quoteCloseBtn.addEventListener('click', closeAllModals);

  [modalOverlay, quoteModalOverlay].forEach(overlay => {
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeAllModals();
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // 8. AC TONNAGE & ROOM SIZING CALCULATOR
  const roomAreaInput = document.getElementById('roomAreaInput');
  const calcResultTon = document.getElementById('calcResultTon');
  const calcResultTag = document.getElementById('calcResultTag');

  const calculateTonnage = () => {
    if (!roomAreaInput || !calcResultTon) return;
    const sqft = parseFloat(roomAreaInput.value);

    if (isNaN(sqft) || sqft <= 0) {
      calcResultTon.textContent = '1.0 Ton';
      calcResultTag.textContent = 'Standard Room';
      return;
    }

    if (sqft <= 130) {
      calcResultTon.textContent = '0.8 - 1.0 Ton';
      calcResultTag.textContent = 'Compact Bedroom / Study';
    } else if (sqft <= 190) {
      calcResultTon.textContent = '1.5 Ton';
      calcResultTag.textContent = 'Master Bedroom / Living Room';
    } else if (sqft <= 290) {
      calcResultTon.textContent = '2.0 Ton';
      calcResultTag.textContent = 'Large Hall / Open Kitchen';
    } else {
      calcResultTon.textContent = '2.5 Ton+ / VRV';
      calcResultTag.textContent = 'Villas & Commercial Space';
    }
  };

  if (roomAreaInput) {
    roomAreaInput.addEventListener('input', calculateTonnage);
  }

  // 9. FAQ ACCORDION
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (questionBtn && answer) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Optional: close other opened FAQs
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherAns = otherItem.querySelector('.faq-answer');
            if (otherAns) otherAns.style.maxHeight = null;
          }
        });

        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        }
      });
    }
  });

  // Open first FAQ by default
  if (faqItems.length > 0) {
    const firstItem = faqItems[0];
    const firstAns = firstItem.querySelector('.faq-answer');
    firstItem.classList.add('active');
    if (firstAns) firstAns.style.maxHeight = firstAns.scrollHeight + 'px';
  }

  // 10. TOAST NOTIFICATION & FORM SUBMISSION
  const toastNotice = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');

  const showToast = (message) => {
    if (!toastNotice || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 4500);
  };

  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeAllModals();
      showToast('✓ Request received! A Coolzone Daikin certified specialist will reach out within 2 hours.');
      quoteForm.reset();
    });
  }

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('✓ Subscribed! You will receive Coolzone seasonal energy-saving guides.');
      newsletterForm.reset();
    });
  }



  // 12. ABOUT 3D FLIP CARDS (TOUCH & CLICK SUPPORT - ZERO LAG)
  const flipCards = document.querySelectorAll('.flip-card');
  flipCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-flip-action')) return;
      card.classList.toggle('flipped');
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

  // 13. SMART CLIMATE ROOM SPACE GUIDE (INTERACTIVE ROOM SELECTOR)
  const spaceTabs = document.querySelectorAll('.space-tab');
  const spacePanels = document.querySelectorAll('.space-panel');
  if (spaceTabs.length && spacePanels.length) {
    spaceTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const space = tab.getAttribute('data-space');
        spaceTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        spacePanels.forEach(p => {
          p.classList.remove('active');
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const targetPanel = document.getElementById(`panel-${space}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }
});

