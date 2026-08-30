document.addEventListener('DOMContentLoaded', function () {
  // ===== Footer year =====
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Mobile nav toggle =====
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===================================================
  // Multi-step onboarding form
  // ===================================================
  var form = document.getElementById('onboardingForm');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.form-step'));
  var totalSteps = steps.length;
  var currentStep = 1;

  var progressBar = document.getElementById('formProgressBar');
  var stepsLabel = document.getElementById('formStepsLabel');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var submitBtn = document.getElementById('submitBtn');
  var formError = document.getElementById('formError');
  var formSuccess = document.getElementById('formSuccess');
  var reviewGrid = document.getElementById('reviewGrid');

  // ----- Pill (single-select button group) behavior -----
  form.querySelectorAll('.pill-group').forEach(function (group) {
    var fieldName = group.getAttribute('data-name');
    var hiddenInput = form.querySelector('input[type="hidden"][name="' + cssEscape(fieldName) + '"]');
    group.querySelectorAll('.pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        group.querySelectorAll('.pill').forEach(function (p) { p.classList.remove('selected'); });
        pill.classList.add('selected');
        if (hiddenInput) hiddenInput.value = pill.getAttribute('data-value');
        clearError();
      });
    });
  });

  function cssEscape(str) {
    return str.replace(/([ #.;:?%&,+*~'"!^$\[\]()=>|\/@])/g, '\\$1');
  }

  // ----- Industry-specific software examples -----
  var INDUSTRY_SOFTWARE_EXAMPLES = {
    'Home Services (HVAC, Plumbing, Electrical, etc.)': 'ServiceTitan, Housecall Pro, Jobber, QuickBooks',
    'Construction / Contracting': 'Procore, Buildertrend, CoConstruct, QuickBooks',
    'Real Estate': 'MLS/CRM tools like Follow Up Boss or kvCORE, DocuSign, QuickBooks',
    'Healthcare / Medical': 'An EHR/EMR system (e.g. Epic, athenahealth), practice management software, QuickBooks',
    'Legal': 'Clio, MyCase, PracticePanther, QuickBooks',
    'Retail / E-Commerce': 'Shopify, Square, WooCommerce, QuickBooks',
    'Hospitality / Food & Beverage': 'Toast, Square, OpenTable, QuickBooks',
    'Professional Services (Consulting, Accounting, etc.)': 'QuickBooks, HubSpot or another CRM, project tools like Asana',
    'Manufacturing': 'An ERP system (e.g. NetSuite, SAP), inventory software, QuickBooks',
    'Finance / Insurance': 'AMS/CRM tools like Applied Epic or Salesforce, QuickBooks',
    'Logistics / Transportation': 'A TMS/dispatch platform (e.g. Samsara, McLeod), QuickBooks',
    'Marketing / Creative Agency': 'HubSpot, Asana or Monday.com, QuickBooks',
    'Nonprofit': 'A donor CRM (e.g. Bloomerang, DonorPerfect), QuickBooks',
    'Technology / SaaS': 'Salesforce or HubSpot, Jira, QuickBooks or Stripe',
    'Other': 'accounting software like QuickBooks, a CRM, and scheduling/invoicing tools'
  };
  var industrySelect = document.getElementById('industry');
  var softwareHint = document.getElementById('softwareHint');
  function updateSoftwareHint() {
    if (!industrySelect || !softwareHint) return;
    var examples = INDUSTRY_SOFTWARE_EXAMPLES[industrySelect.value];
    softwareHint.textContent = examples
      ? 'Common in this industry: ' + examples + '.'
      : 'Think accounting/invoicing, CRM, scheduling, or any tool that runs a part of your day-to-day. Select an industry above for common examples.';
  }
  if (industrySelect) {
    industrySelect.addEventListener('change', updateSoftwareHint);
  }

  function showStep(n) {
    steps.forEach(function (step) {
      step.classList.toggle('active', parseInt(step.getAttribute('data-step'), 10) === n);
    });
    var pct = (n / totalSteps) * 100;
    progressBar.style.width = pct + '%';
    stepsLabel.textContent = 'Step ' + n + ' of ' + totalSteps;
    prevBtn.classList.toggle('show', n > 1);

    if (n === totalSteps) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
      buildReview();
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }
    clearError();
    window.scrollTo({ top: form.closest('.form-card').offsetTop - 110, behavior: 'smooth' });
  }

  function clearError() {
    formError.textContent = '';
  }

  function showError(msg) {
    formError.textContent = msg;
  }

  function validateStep(n) {
    var stepEl = steps[n - 1];
    var requiredFields = stepEl.querySelectorAll('[required]');
    var valid = true;
    var firstInvalid = null;

    requiredFields.forEach(function (field) {
      field.classList.add('touched');
      if (field.type === 'hidden') {
        if (!field.value) { valid = false; if (!firstInvalid) firstInvalid = field; }
      } else if (!field.checkValidity()) {
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!valid) {
      if (firstInvalid && firstInvalid.type !== 'hidden' && firstInvalid.focus) {
        firstInvalid.focus();
      }
      showError('Please fill in the required fields before continuing.');
    }
    return valid;
  }

  // Re-checks every step (not just the currently visible one) before final submit,
  // since all steps share one <form> and an earlier required field could still be empty.
  function validateAllSteps() {
    for (var i = 1; i < totalSteps; i++) {
      var stepEl = steps[i - 1];
      var requiredFields = Array.prototype.slice.call(stepEl.querySelectorAll('[required]'));
      var stepValid = requiredFields.every(function (field) {
        return field.type === 'hidden' ? !!field.value : field.checkValidity();
      });
      if (!stepValid) {
        currentStep = i;
        showStep(currentStep);
        validateStep(currentStep);
        return false;
      }
    }
    return true;
  }

  nextBtn.addEventListener('click', function () {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
    }
  });

  prevBtn.addEventListener('click', function () {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // ----- Build review summary on final step -----
  function buildReview() {
    reviewGrid.innerHTML = '';
    var seen = {};
    var formData = new FormData(form);
    var order = [
      'Full Name', 'Email', 'Phone', 'Company Name', 'Role',
      'Industry', 'Company Size', 'Website', 'Years in Business', 'Business Description',
      'Current Software',
      'Pain Points', 'Biggest Challenge', 'Success Definition',
      'AI Knowledge Level', 'Current Tools', 'Timeline', 'Budget Range',
      'Referral Source', 'Best Time to Contact', 'Additional Info'
    ];

    order.forEach(function (key) {
      var values = formData.getAll(key).filter(Boolean);
      if (!values.length) return;
      var dl = document.createElement('div');
      dl.className = 'review-item';
      var dt = document.createElement('dt');
      dt.textContent = key;
      var dd = document.createElement('dd');
      dd.textContent = values.join(', ');
      dl.appendChild(dt);
      dl.appendChild(dd);
      reviewGrid.appendChild(dl);
    });
  }

  // ----- Submit handling (Netlify AJAX pattern with graceful fallback) -----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateAllSteps()) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    var data = new FormData(form);
    var encoded = new URLSearchParams();
    data.forEach(function (value, key) { encoded.append(key, value); });

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encoded.toString()
    })
      .then(function () {
        form.style.display = 'none';
        document.querySelector('.form-progress').style.display = 'none';
        stepsLabel.style.display = 'none';
        formSuccess.classList.add('show');
      })
      .catch(function () {
        // Fallback: let the browser submit the form natively to thank-you.html
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit My Info';
        form.submit();
      });
  });

  showStep(currentStep);
});
