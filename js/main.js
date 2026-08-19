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
    if (!validateStep(totalSteps)) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
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
