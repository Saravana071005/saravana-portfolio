/**
 * SARAVANAKUMAR L — PERSONAL PORTFOLIO SCRIPT
 * Interactive FSM Simulator, IoT Telemetry Pipeline, Modals, Animations & Theme Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initCounters();
  initFsmSimulator();
  initIotPipeline();
  initSeatMap();
  initProjectsFilter();
  initModals();
  initClipboardActions();
});

/* ==========================================================================
   1. THEME SWITCHER (DARK / LIGHT)
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const storedTheme = localStorage.getItem('theme-preference') || 'light';

  document.documentElement.setAttribute('data-theme', storedTheme);
  updateThemeIcon(storedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme-preference', next);
      updateThemeIcon(next);
      showToast(next === 'dark' ? 'Dark theme enabled' : 'Light theme enabled');
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggleBtn i');
  if (!icon) return;
  if (theme === 'light') {
    icon.className = 'fas fa-moon';
  } else {
    icon.className = 'fas fa-sun';
  }
}

/* ==========================================================================
   2. NAVBAR & MOBILE MENU
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll background
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // Active section spy
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(s => observer.observe(s));
}

/* ==========================================================================
   3. HERO STATS COUNTER ANIMATION
   ========================================================================== */
function initCounters() {
  const statsContainer = document.querySelector('.stats-card-container');
  if (!statsContainer) return;

  let animated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateNumber('statProjects', 0, 4, 1200);
        animateNumber('statCerts', 0, 3, 1000);
        animateNumber('statSkills', 0, 6, 1100);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsContainer);
}

function animateNumber(id, start, end, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutQuad
    const current = Math.floor(start + (end - start) * (progress * (2 - progress)));
    el.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = end;
    }
  }
  requestAnimationFrame(update);
}

/* ==========================================================================
   4. INTERACTIVE FSM STATE MACHINE SIMULATOR (PROJECT 1)
   ========================================================================== */
const fsmData = {
  AVAILABLE: {
    title: "AVAILABLE",
    desc: "Item is in stock and ready for customers to view and add to cart.",
    nextAllowed: ["RESERVED"],
    readout: "Status: [AVAILABLE] • Inventory count: 10 • Item visible in store catalog."
  },
  RESERVED: {
    title: "RESERVED",
    desc: "Item is temporarily locked during active user checkout (10-minute hold).",
    nextAllowed: ["SOLD", "AVAILABLE"],
    readout: "Status: [RESERVED] • Inventory locked • Timer active: 09:59 • Preventing overselling."
  },
  SOLD: {
    title: "SOLD",
    desc: "Payment confirmed via gateway. Inventory stock permanently decremented.",
    nextAllowed: ["AVAILABLE"],
    readout: "Status: [SOLD] • Invoice #INV-8924 generated • Order moved to fulfillment."
  }
};

let currentFsmState = "AVAILABLE";

function initFsmSimulator() {
  updateFsmDisplay(currentFsmState);

  const reserveBtn = document.getElementById('btnFsmReserve');
  const purchaseBtn = document.getElementById('btnFsmPurchase');
  const cancelBtn = document.getElementById('btnFsmCancel');
  const resetBtn = document.getElementById('btnFsmReset');

  if (reserveBtn) {
    reserveBtn.addEventListener('click', () => transitionFsm('RESERVED'));
  }
  if (purchaseBtn) {
    purchaseBtn.addEventListener('click', () => transitionFsm('SOLD'));
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => transitionFsm('AVAILABLE', 'Reservation released back to stock.'));
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => transitionFsm('AVAILABLE', 'FSM simulator reset to initial stock state.'));
  }
}

function transitionFsm(targetState, customMsg) {
  currentFsmState = targetState;
  updateFsmDisplay(targetState, customMsg);
}

function updateFsmDisplay(state, customMsg) {
  // Update node active classes
  const nodes = document.querySelectorAll('.fsm-node');
  nodes.forEach(node => {
    if (node.dataset.state === state) {
      node.classList.add('active');
    } else {
      node.classList.remove('active');
    }
  });

  // Update status readout
  const readout = document.getElementById('fsmStatusReadout');
  if (readout) {
    readout.innerHTML = customMsg ? `<strong>Update:</strong> ${customMsg}` : fsmData[state].readout;
  }
}

/* ==========================================================================
   5. INTERACTIVE IOT ROAD DAMAGE PIPELINE SIMULATOR (PROJECT 2)
   ========================================================================== */
function initIotPipeline() {
  const triggerBtn = document.getElementById('btnIotTrigger');
  if (!triggerBtn) return;

  const steps = [
    { id: 'stepRoad', name: 'ROAD ANOMALY', log: 'Vehicle tire hits deep road depression/pothole.' },
    { id: 'stepSensor', name: 'SENSOR SPIKE', log: 'MPU-6050 Accelerometer: Z-axis shock = +3.82g (Threshold: >2.5g).' },
    { id: 'stepDamage', name: 'DAMAGE DETECTED', log: 'Microcontroller classifies event: Severity 4 Pothole detected.' },
    { id: 'stepGps', name: 'GPS GEOTAGGING', log: 'NEO-6M GPS locked: Lat 10.7870° N, Lon 79.1378° E (Thanjavur bypass).' },
    { id: 'stepAlert', name: 'DISPATCHING ALERT', log: 'Packaging JSON alert with telemetry & timestamp -> LTE transmission.' },
    { id: 'stepAuthority', name: 'AUTHORITY NOTIFIED', log: 'Thanjavur Highway Maintenance Dept received work-order #RDM-204.' }
  ];

  let isRunning = false;

  triggerBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    triggerBtn.disabled = true;
    triggerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Simulating Telemetry...';

    const consoleBox = document.getElementById('iotConsoleLog');
    const stepElements = steps.map(s => document.getElementById(s.id));

    // Clear previous active states
    stepElements.forEach(el => el && el.classList.remove('active-step'));

    let currentStepIndex = 0;

    function runNextStep() {
      if (currentStepIndex < steps.length) {
        const s = steps[currentStepIndex];
        const el = stepElements[currentStepIndex];
        if (el) el.classList.add('active-step');
        if (consoleBox) {
          consoleBox.innerHTML = `[${new Date().toLocaleTimeString()}] <strong>${s.name}:</strong> ${s.log}`;
        }
        currentStepIndex++;
        setTimeout(runNextStep, 700);
      } else {
        isRunning = false;
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = '<i class="fas fa-play"></i> Re-Simulate Road Impact';
        showToast('IoT Alert Successfully Sent to Municipal Authority!');
      }
    }

    runNextStep();
  });
}

/* ==========================================================================
   6. AIRLINE REAL-TIME SEAT ALLOCATION SIMULATOR (PROJECT 4)
   ========================================================================== */
function initSeatMap() {
  const seats = document.querySelectorAll('.plane-seat');
  const seatInfo = document.getElementById('seatSelectionInfo');
  if (!seats.length || !seatInfo) return;

  seats.forEach(seat => {
    seat.addEventListener('click', () => {
      if (seat.classList.contains('occupied')) {
        showToast('This seat is already booked by another passenger.');
        return;
      }

      seats.forEach(s => s.classList.remove('selected'));
      seat.classList.add('selected');

      const seatNum = seat.dataset.seat;
      const seatPrice = seat.dataset.price || '₹3,450';
      seatInfo.innerHTML = `Selected Seat: <strong>${seatNum}</strong> (Standard Economy) • Fare: <strong>${seatPrice}</strong> • Status: Ready to book`;
    });
  });
}

/* ==========================================================================
   7. PROJECTS FILTER TABS
   ========================================================================== */
function initProjectsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      projectCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   8. PROJECT CASE STUDY MODALS
   ========================================================================== */
const projectCaseStudies = {
  1: {
    title: "Dynamic E-Commerce Platform with FSM-Based Product State Management",
    category: "Full-Stack Development • Web",
    problem: "In traditional e-commerce platforms, simultaneous user checkouts often lead to overselling, race conditions, or inconsistent stock availability when cart sessions expire unhandled.",
    solution: "Implemented an architectural Finite State Machine (FSM) pattern that dictates precise transitions across discrete lifecycle states: Available -> Reserved -> Sold -> Expired. A timed hold prevents double-allocation while releasing abandoned items back into general stock seamlessly.",
    workflow: "1. Available: Item is browsable and active in database.\n2. Reserved: User initiates checkout; inventory decrements with a 10-minute lease.\n3. Sold: Payment callback confirms transaction; status locks to immutable Sold.\n4. Cancellation/Timeout: If lease expires before payment, FSM reverts to Available.",
    learnings: "State machine architecture eliminates race conditions and clarifies business logic across frontend React interfaces and backend REST endpoints."
  },
  2: {
    title: "IoT-Based Road Damage Detection and Alert System",
    category: "IoT / Smart Technology • Real-Time Systems",
    problem: "Potholes and road degradation cause severe traffic accidents and vehicle wear. Municipal road inspection is predominantly manual, slow, and reactive rather than predictive.",
    solution: "Designed an automated IoT telemetry node equipped with vibration/accelerometer sensors and GPS modules. When vehicles encounter road anomalies above a pre-set acceleration threshold, the system extracts coordinates and triggers an instant alert to municipal authorities.",
    workflow: "Road surface impact -> Accelerometer 3-axis threshold evaluation -> Damage categorization -> GPS geotagging -> Secure HTTP payload dispatch -> Municipal GIS dashboard notification.",
    learnings: "Practical sensor threshold calibration is essential to filter out ordinary vehicle braking or speed bumps from actual severe pavement potholes."
  },
  3: {
    title: "Pharmacy & Medicine Inventory & Billing System",
    category: "Healthcare Inventory & Billing Systems",
    problem: "Small-to-medium retail pharmacies face expired stock liabilities, delayed billing during peak hours, and manual discrepancies between ledger counts and physical inventory.",
    solution: "Created an integrated inventory database and rapid barcode-compatible billing system with automated stock deductions, batch expiration warnings, and immediate invoice generation.",
    workflow: "Medicine intake with batch numbers -> Automated inventory categorization -> Fast POS cart calculation with tax rules -> Instant invoice printing & dynamic stock level adjustment.",
    learnings: "Database indexing and relational constraints ensure audit reliability and prevent medicine stock discrepancies."
  },
  4: {
    title: "Real-Time Seat Allocation & Airline Management System",
    category: "Transportation Management Systems",
    problem: "Real-time seat selection requires strict state synchronization to ensure multiple passengers cannot reserve or purchase the exact same seat concurrently.",
    solution: "Engineered an interactive seat map with real-time seat status synchronization, booking state progression, and tiered fare calculation based on cabin class and seat position.",
    workflow: "Flight search -> Real-time visual seat map rendering -> Temporary seat reservation hold -> Passenger details verification -> Ticket generation and automated billing.",
    learnings: "Stateful booking sessions combined with intuitive UI feedback create frictionless user experiences in reservation workflows."
  },
  5: {
    title: "AI-Based Automated Practice Question Generation System",
    category: "Artificial Intelligence in Education",
    problem: "Educators and self-learners spend significant time manually drafting comprehension questions and quizzes from lengthy study material.",
    solution: "Developed an AI-assisted application that consumes educational textbooks or lecture transcripts, identifies core topics via Natural Language Processing, and automatically produces multiple-choice and conceptual practice questions.",
    workflow: "Text extraction & cleaning -> Transformer NLP model analysis -> Key concept extraction -> Question & distractor generation -> Output review interface.",
    learnings: "Prompt constraints and temperature control are vital for generating educationally accurate distractors in multiple-choice questions."
  }
};

function initModals() {
  const modalOverlay = document.getElementById('caseStudyModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const openBtns = document.querySelectorAll('.btn-open-case-study');

  if (!modalOverlay) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.project;
      const data = projectCaseStudies[pid];
      if (data) {
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalCategory').textContent = data.category;
        document.getElementById('modalProblem').textContent = data.problem;
        document.getElementById('modalSolution').textContent = data.solution;
        document.getElementById('modalWorkflow').innerHTML = data.workflow.replace(/\n/g, '<br>');
        document.getElementById('modalLearnings').textContent = data.learnings;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   9. ONE-CLICK CLIPBOARD ACTIONS
   ========================================================================== */
function initClipboardActions() {
  const copyEmailBtns = document.querySelectorAll('.btn-copy-email');
  copyEmailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText('saravanakumar0701h@gmail.com').then(() => {
        showToast('Copied email: saravanakumar0701h@gmail.com');
      }).catch(() => {
        showToast('Email: saravanakumar0701h@gmail.com');
      });
    });
  });
}

/* ==========================================================================
   10. TOAST NOTIFICATION UTILITY
   ========================================================================== */
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');
  if (!toast || !toastText) return;

  toastText.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
