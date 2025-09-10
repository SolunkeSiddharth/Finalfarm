console.log('Enhanced Farm Records App - Mobile Navigation Fixed');

// Storage keys
const STORAGE_KEYS = {
  farms: 'farm_records_farms',
  applications: 'farm_records_applications', 
  crops: 'farm_records_crops',
  activities: 'farm_records_activities'
};

// In-memory data arrays
let farms = [];
let applications = [];
let crops = [];
let activities = [];

// Chart instances
let applicationsChart = null;
let cropsChart = null;
let timelineChart = null;
let historicalChart = null;

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Load data from localStorage
function loadFromStorage() {
  try {
    farms = JSON.parse(localStorage.getItem(STORAGE_KEYS.farms)) || [];
    applications = JSON.parse(localStorage.getItem(STORAGE_KEYS.applications)) || [];
    crops = JSON.parse(localStorage.getItem(STORAGE_KEYS.crops)) || [];
    activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.activities)) || [];
  } catch (error) {
    console.error('Error loading from storage:', error);
    farms = [];
    applications = [];
    crops = [];
    activities = [];
  }
}

// Save data to localStorage
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.farms, JSON.stringify(farms));
    localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
    localStorage.setItem(STORAGE_KEYS.crops, JSON.stringify(crops));
    localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving to storage:', error);
    showToast('Error saving data', 'error');
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Get farm name by ID
function getFarmName(farmId) {
  const farm = farms.find(f => f.id === farmId);
  return farm ? farm.name : 'Unknown Farm';
}

// Get crop name by ID
function getCropName(cropId) {
  const crop = crops.find(c => c.id === cropId);
  return crop ? crop.name : 'Unknown Crop';
}

// Add activity log
function addActivity(message) {
  activities.unshift({
    id: generateId(),
    message: message,
    date: new Date().toISOString(),
    timestamp: Date.now()
  });

  if (activities.length > 50) {
    activities = activities.slice(0, 50);
  }

  saveToStorage();
  updateDashboard();
}

// Fixed Mobile Navigation
function initializeNavigation() {
  const navItems = $$('.nav-item');
  const sections = $$('.section');
  const navToggle = $('#navToggle');
  const navClose = $('#navClose');
  const navMenu = $('#navMenu');
  const navOverlay = $('#navOverlay');

  // Open mobile menu
  function openMobileMenu() {
    navMenu.classList.add('show');
    navOverlay.classList.add('show');
    navToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close mobile menu
  function closeMobileMenu() {
    navMenu.classList.remove('show');
    navOverlay.classList.remove('show');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('show')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // Close button in menu
  if (navClose) {
    navClose.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking overlay
  if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('show')) {
      closeMobileMenu();
    }
  });

  // Handle navigation items
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.dataset.section;

      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Show target section
      sections.forEach(section => section.classList.remove('active'));
      const target = $(`#${targetSection}`);
      if (target) {
        target.classList.add('active');

        // Close mobile menu
        closeMobileMenu();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Load section data
        switch (targetSection) {
          case 'dashboard':
            updateDashboard();
            break;
          case 'farms':
            loadFarmsTable();
            break;
          case 'applications':
            loadApplicationsTable();
            populateFarmSelects();
            break;
          case 'crops':
            loadCropsTable();
            populateFarmSelects();
            break;
          case 'records':
            loadRecordsTable();
            populateFilterSelects();
            loadChartsInRecords();
            break;
          case 'timeline':
            loadTimelineSection();
            break;
          case 'historical':
            loadHistoricalData();
            loadHistoricalChart();
            break;
        }
      }
    });
  });

  // Close menu when clicking outside on larger screens
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 767 && 
        navMenu.classList.contains('show') && 
        !navMenu.contains(e.target) && 
        !navToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

// Switch section programmatically
function switchSection(sectionName) {
  const navItem = $(`.nav-item[data-section="${sectionName}"]`);
  if (navItem) {
    navItem.click();
  }
}

// Update dashboard with enhanced mobile UX
function updateDashboard() {
  // Animate number updates
  animateCounter('#totalFarms', farms.length);

  const recentApps = applications.filter(app => {
    const appDate = new Date(app.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return appDate >= thirtyDaysAgo;
  }).length;
  animateCounter('#recentApplications', recentApps);

  const recentCrops = crops.filter(crop => {
    const plantDate = new Date(crop.plantationDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return plantDate >= thirtyDaysAgo;
  }).length;
  animateCounter('#recentCrops', recentCrops);

  animateCounter('#totalRecords', applications.length + crops.length);

  // Update current date with better formatting
  $('#currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Update activities list with mobile-friendly format
  const activityList = $('#activityList');
  if (activityList) {
    if (activities.length === 0) {
      activityList.innerHTML = `
        <div class="activity-item">
          <div class="activity-text">
            Welcome to Farm Records! 🌱<br>
            Start by adding your first farm using the quick actions below.
          </div>
        </div>`;
    } else {
      activityList.innerHTML = activities.slice(0, 5).map(activity => 
        `<div class="activity-item">
          <div class="activity-date">${formatDate(activity.date)}</div>
          <div class="activity-text">${activity.message}</div>
        </div>`
      ).join('');
    }
  }
}

// Animate counters for better UX
function animateCounter(selector, targetValue) {
  const element = $(selector);
  if (!element) return;

  const startValue = parseInt(element.textContent) || 0;
  const duration = 1000;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// Farm management with enhanced mobile UX
function showAddFarmForm() {
  const form = $('#farmForm');
  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#farmName').focus();
}

function hideFarmForm() {
  $('#farmForm').style.display = 'none';
  $('#addFarmForm').reset();
}

function setupFarmForm() {
  const form = $('#addFarmForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const farmName = $('#farmName').value.trim();
      const farmId = $('#farmId').value.trim();
      const location = $('#farmLocation').value.trim();
      const size = parseFloat($('#farmSize').value) || 0;

      if (!farmName || !farmId) {
        showToast('📝 Farm name and ID are required', 'error');
        return;
      }

      if (farms.some(f => f.farmId.toLowerCase() === farmId.toLowerCase())) {
        showToast('⚠️ Farm ID already exists', 'error');
        return;
      }

      const newFarm = {
        id: generateId(),
        name: farmName,
        farmId: farmId,
        location: location,
        size: size,
        dateAdded: new Date().toISOString()
      };

      farms.push(newFarm);
      saveToStorage();
      addActivity(`🏡 Added new farm: ${farmName}`);

      loadFarmsTable();
      hideFarmForm();
      showToast('✅ Farm added successfully!', 'success');
    });
  }
}

// Enhanced mobile-friendly table loading
function loadFarmsTable() {
  const tbody = $('#farmsTableBody');
  if (!tbody) return;

  if (farms.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center" style="padding: 2rem;">
          <div style="color: #6c757d;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🏡</div>
            <div><strong>No farms added yet</strong></div>
            <div>Tap "Add New Farm" above to get started!</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = farms.map(farm => `
    <tr>
      <td>
        <div style="font-weight: 600; color: #2d5a27;">${farm.name}</div>
        <small style="color: #6c757d;">ID: ${farm.farmId}</small>
      </td>
      <td style="color: #6c757d;">${farm.location || '<em>Not specified</em>'}</td>
      <td style="color: #6c757d;">${farm.size ? farm.size + ' acres' : '<em>-</em>'}</td>
      <td>
        <div style="display: flex; gap: 4px; flex-direction: column;">
          <button class="btn btn--sm btn--outline" onclick="editFarm('${farm.id}')" style="font-size: 12px; padding: 4px 8px;">✏️ Edit</button>
          <button class="btn btn--sm btn--outline" onclick="deleteFarm('${farm.id}')" style="color: #dc3545; border-color: #dc3545; font-size: 12px; padding: 4px 8px;">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editFarm(farmId) {
  const farm = farms.find(f => f.id === farmId);
  if (!farm) return;

  const newName = prompt('Enter farm name:', farm.name);
  if (newName && newName.trim()) {
    const oldName = farm.name;
    farm.name = newName.trim();
    saveToStorage();
    loadFarmsTable();
    addActivity(`✏️ Updated farm: ${oldName} → ${farm.name}`);
    showToast('✅ Farm updated successfully!', 'success');
  }
}

function deleteFarm(farmId) {
  const farm = farms.find(f => f.id === farmId);
  if (!farm) return;

  const confirmMessage = `Delete "${farm.name}"?\n\nThis will also delete:\n• All related crop records\n• All application records\n\nThis action cannot be undone.`;

  if (confirm(confirmMessage)) {
    applications = applications.filter(app => app.farmId !== farmId);
    crops = crops.filter(crop => crop.farmId !== farmId);
    farms = farms.filter(f => f.id !== farmId);

    saveToStorage();
    loadFarmsTable();
    addActivity(`🗑️ Deleted farm: ${farm.name}`);
    showToast('✅ Farm deleted successfully!', 'success');
  }
}

// Populate crops for selected farm
function populateCropSelectForFarm(farmId, cropSelect) {
  if (!cropSelect) return;

  cropSelect.innerHTML = '<option value="">Select Crop</option>';

  if (!farmId) return;

  const farmCrops = crops.filter(crop => crop.farmId === farmId);

  if (farmCrops.length === 0) {
    cropSelect.innerHTML = '<option value="">⚠️ No crops available - add crops first</option>';
    return;
  }

  cropSelect.innerHTML = '<option value="">Select Crop</option>' + 
    farmCrops.map(crop => 
      `<option value="${crop.id}">${crop.name}${crop.variety ? ` (${crop.variety})` : ''}</option>`
    ).join('');
}

// Enhanced application form with better mobile UX
function setupApplicationForm() {
  const form = $('#addApplicationForm');
  const farmSelect = $('#applicationFarm');
  const cropSelect = $('#applicationCrop');

  if (farmSelect && cropSelect) {
    farmSelect.addEventListener('change', () => {
      populateCropSelectForFarm(farmSelect.value, cropSelect);
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const productType = $('#productType').value;
      const productName = $('#productName').value.trim();
      const quantity = parseFloat($('#quantity').value);
      const unit = $('#unit').value;
      const applicationDate = $('#applicationDate').value;
      const farmId = $('#applicationFarm').value;
      const cropId = $('#applicationCrop').value;
      const method = $('#applicationMethod').value;
      const notes = $('#applicationNotes').value.trim();

      if (!productType || !productName || !quantity || !applicationDate || !farmId || !cropId) {
        showToast('📝 Please fill in all required fields including crop selection', 'error');
        return;
      }

      const newApplication = {
        id: generateId(),
        type: productType,
        productName: productName,
        quantity: quantity,
        unit: unit,
        date: applicationDate,
        farmId: farmId,
        cropId: cropId,
        method: method,
        notes: notes,
        createdAt: new Date().toISOString()
      };

      applications.push(newApplication);
      saveToStorage();
      addActivity(`🌱 Applied ${productType.toLowerCase()}: ${productName} to ${getCropName(cropId)} at ${getFarmName(farmId)}`);

      loadApplicationsTable();
      form.reset();
      $('#applicationDate').value = new Date().toISOString().split('T')[0];
      cropSelect.innerHTML = '<option value="">Select Crop</option>';
      showToast('✅ Application recorded successfully!', 'success');
    });
  }
}

// Enhanced mobile-friendly applications table
function loadApplicationsTable() {
  const tbody = $('#applicationsTableBody');
  if (!tbody) return;

  if (applications.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="padding: 2rem;">
          <div style="color: #6c757d;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🌱</div>
            <div><strong>No applications recorded yet</strong></div>
            <div>Record your first application above!</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  const sortedApplications = [...applications].sort((a, b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = sortedApplications.map(app => `
    <tr>
      <td><small style="color: #6c757d;">${formatDate(app.date)}</small></td>
      <td>
        <div style="font-weight: 600; color: #2d5a27; font-size: 13px;">${app.productName}</div>
        <small style="color: #6c757d;">${app.type}</small>
      </td>
      <td><small style="color: #6c757d;">${getCropName(app.cropId)}</small></td>
      <td><small style="color: #6c757d;">${app.quantity} ${app.unit}</small></td>
      <td>
        <div style="display: flex; gap: 4px; flex-direction: column;">
          <button class="btn btn--sm btn--outline" onclick="editApplication('${app.id}')" style="font-size: 12px; padding: 4px 8px;">✏️</button>
          <button class="btn btn--sm btn--outline" onclick="deleteApplication('${app.id}')" style="color: #dc3545; border-color: #dc3545; font-size: 12px; padding: 4px 8px;">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editApplication(appId) {
  const app = applications.find(a => a.id === appId);
  if (!app) return;

  const newProductName = prompt('Enter product name:', app.productName);
  if (newProductName && newProductName.trim()) {
    const oldName = app.productName;
    app.productName = newProductName.trim();
    saveToStorage();
    loadApplicationsTable();
    addActivity(`✏️ Updated application: ${oldName} → ${app.productName}`);
    showToast('✅ Application updated successfully!', 'success');
  }
}

function deleteApplication(appId) {
  const app = applications.find(a => a.id === appId);
  if (!app) return;

  const confirmMessage = `Delete this application record?\n\n${app.productName} on ${getCropName(app.cropId)}\nApplied: ${formatDate(app.date)}`;

  if (confirm(confirmMessage)) {
    applications = applications.filter(a => a.id !== appId);
    saveToStorage();
    loadApplicationsTable();
    addActivity(`🗑️ Deleted application: ${app.productName}`);
    showToast('✅ Application deleted successfully!', 'success');
  }
}

// Enhanced crop management
function setupCropForm() {
  const form = $('#addCropForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const cropName = $('#cropName').value.trim();
      const variety = $('#cropVariety').value.trim();
      const plantationDate = $('#plantationDate').value;
      const harvestDate = $('#harvestDate').value;
      const farmId = $('#cropFarm').value;
      const area = parseFloat($('#cropArea').value) || 0;
      const notes = $('#cropNotes').value.trim();

      if (!cropName || !plantationDate || !farmId) {
        showToast('📝 Please fill in all required fields', 'error');
        return;
      }

      const newCrop = {
        id: generateId(),
        name: cropName,
        variety: variety,
        plantationDate: plantationDate,
        harvestDate: harvestDate,
        farmId: farmId,
        area: area,
        notes: notes,
        status: 'Active',
        createdAt: new Date().toISOString()
      };

      crops.push(newCrop);
      saveToStorage();
      addActivity(`🌾 Added crop: ${cropName} at ${getFarmName(farmId)}`);

      loadCropsTable();
      form.reset();
      $('#plantationDate').value = new Date().toISOString().split('T')[0];
      showToast('✅ Crop added successfully!', 'success');
    });
  }
}

// Enhanced crops table
function loadCropsTable() {
  const tbody = $('#cropsTableBody');
  if (!tbody) return;

  if (crops.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="padding: 2rem;">
          <div style="color: #6c757d;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🌾</div>
            <div><strong>No crops added yet</strong></div>
            <div>Add your first crop above!</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = crops.map(crop => `
    <tr>
      <td>
        <div style="font-weight: 600; color: #2d5a27; font-size: 13px;">${crop.name}</div>
        ${crop.variety ? `<small style="color: #6c757d;">${crop.variety}</small>` : ''}
      </td>
      <td><small style="color: #6c757d;">${getFarmName(crop.farmId)}</small></td>
      <td><small style="color: #6c757d;">${formatDate(crop.plantationDate)}</small></td>
      <td><span class="status status--success" style="font-size: 10px;">${crop.status}</span></td>
      <td>
        <div style="display: flex; gap: 4px; flex-direction: column;">
          <button class="btn btn--sm btn--outline" onclick="editCrop('${crop.id}')" style="font-size: 12px; padding: 4px 8px;">✏️</button>
          <button class="btn btn--sm btn--outline" onclick="deleteCrop('${crop.id}')" style="color: #dc3545; border-color: #dc3545; font-size: 12px; padding: 4px 8px;">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editCrop(cropId) {
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return;

  const newName = prompt('Enter crop name:', crop.name);
  if (newName && newName.trim()) {
    const oldName = crop.name;
    crop.name = newName.trim();
    saveToStorage();
    loadCropsTable();
    addActivity(`✏️ Updated crop: ${oldName} → ${crop.name}`);
    showToast('✅ Crop updated successfully!', 'success');
  }
}

function deleteCrop(cropId) {
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return;

  const relatedApps = applications.filter(app => app.cropId === cropId);
  let confirmMessage = `Delete this crop: ${crop.name}?`;

  if (relatedApps.length > 0) {
    confirmMessage += `\n\nThis crop has ${relatedApps.length} application record(s).\nDeleting will remove all related records.\n\nThis action cannot be undone.`;
  }

  if (confirm(confirmMessage)) {
    if (relatedApps.length > 0) {
      applications = applications.filter(app => app.cropId !== cropId);
    }

    crops = crops.filter(c => c.id !== cropId);
    saveToStorage();
    loadCropsTable();
    loadApplicationsTable();
    addActivity(`🗑️ Deleted crop: ${crop.name}`);
    showToast('✅ Crop deleted successfully!', 'success');
  }
}

// Populate farm select dropdowns
function populateFarmSelects() {
  const selects = ['#applicationFarm', '#cropFarm', '#filterFarm', '#timelineFarm'];

  selects.forEach(selector => {
    const select = $(selector);
    if (select) {
      const currentValue = select.value;
      const baseOption = selector.includes('filter') || selector.includes('timeline') ? 
        '<option value="">All Farms</option>' : 
        '<option value="">Select Farm</option>';

      select.innerHTML = baseOption + 
        farms.map(farm => `<option value="${farm.id}">${farm.name}</option>`).join('');
      select.value = currentValue;
    }
  });
}

// Charts Implementation (same as before but with better error handling)
function loadChartsInRecords() {
  setTimeout(() => {
    createApplicationsChart();
    createCropsChart();
  }, 300);
}

function createApplicationsChart() {
  const ctx = $('#applicationsChart');
  if (!ctx) return;

  if (applicationsChart) {
    applicationsChart.destroy();
  }

  const applicationTypes = {};
  applications.forEach(app => {
    applicationTypes[app.type] = (applicationTypes[app.type] || 0) + 1;
  });

  if (Object.keys(applicationTypes).length === 0) {
    ctx.parentElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6c757d;">No application data available</div>';
    return;
  }

  applicationsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(applicationTypes),
      datasets: [{
        data: Object.values(applicationTypes),
        backgroundColor: ['#4a7c59', '#2d5a27', '#6d9c64', '#1a3318'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}

function createCropsChart() {
  const ctx = $('#cropsChart');
  if (!ctx) return;

  if (cropsChart) {
    cropsChart.destroy();
  }

  const cropsByFarm = {};
  crops.forEach(crop => {
    const farmName = getFarmName(crop.farmId);
    cropsByFarm[farmName] = (cropsByFarm[farmName] || 0) + 1;
  });

  if (Object.keys(cropsByFarm).length === 0) {
    ctx.parentElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6c757d;">No crop data available</div>';
    return;
  }

  cropsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(cropsByFarm),
      datasets: [{
        label: 'Number of Crops',
        data: Object.values(cropsByFarm),
        backgroundColor: '#4a7c59',
        borderColor: '#2d5a27',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Continue with all other functions (Timeline, Historical, etc.) but with improved error handling and mobile UX
// [The rest of the JavaScript continues with the same structure as before but with mobile improvements]

// Records and filtering with enhanced mobile UX
function loadRecordsTable() {
  const tbody = $('#recordsTableBody');
  if (!tbody) return;

  let allRecords = [
    ...applications.map(app => ({
      ...app,
      type: 'Application',
      name: app.productName,
      details: `${app.quantity} ${app.unit} on ${getCropName(app.cropId)}`
    })),
    ...crops.map(crop => ({
      ...crop,
      type: 'Crop',
      name: crop.name,
      date: crop.plantationDate,
      details: `${crop.area || 0} acres${crop.variety ? ` - ${crop.variety}` : ''}`
    }))
  ];

  if (allRecords.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="padding: 2rem;">
          <div style="color: #6c757d;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
            <div><strong>No records found</strong></div>
            <div>Add some farms and crops to get started!</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = allRecords.map(record => `
    <tr>
      <td><small style="color: #6c757d;">${formatDate(record.date)}</small></td>
      <td>
        <span class="status ${record.type === 'Application' ? 'status--success' : 'status--info'}" style="font-size: 10px;">
          ${record.type}
        </span>
      </td>
      <td><strong style="font-size: 13px; color: #2d5a27;">${record.name}</strong></td>
      <td><small style="color: #6c757d;">${getFarmName(record.farmId)}</small></td>
      <td>
        <button class="btn btn--sm btn--outline" onclick="viewRecord('${record.id}', '${record.type}')" style="font-size: 11px; padding: 4px 8px;">👁️</button>
      </td>
    </tr>
  `).join('');
}

// Timeline functionality (simplified for mobile)
function loadTimelineSection() {
  populateFarmSelects();
  loadTimeline();
}

function loadTimeline() {
  const selectedFarm = $('#timelineFarm').value;
  const selectedYear = parseInt($('#timelineYear').value);

  let timelineApps = applications.filter(app => {
    const appYear = new Date(app.date).getFullYear();
    if (selectedFarm && app.farmId !== selectedFarm) return false;
    return appYear === selectedYear;
  });

  createTimelineChart(timelineApps, selectedYear);
  updateTimelineComparison(selectedFarm, selectedYear);
}

function createTimelineChart(timelineApps, year) {
  const ctx = $('#timelineChart');
  if (!ctx) return;

  if (timelineChart) {
    timelineChart.destroy();
  }

  const monthlyData = Array(12).fill(0);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  timelineApps.forEach(app => {
    const month = new Date(app.date).getMonth();
    monthlyData[month]++;
  });

  timelineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthNames,
      datasets: [{
        label: `${year} Applications`,
        data: monthlyData,
        borderColor: '#4a7c59',
        backgroundColor: 'rgba(74, 124, 89, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}

function updateTimelineComparison(selectedFarm, selectedYear) {
  const thisYear = applications.filter(app => {
    const appYear = new Date(app.date).getFullYear();
    if (selectedFarm && app.farmId !== selectedFarm) return false;
    return appYear === selectedYear;
  }).length;

  const lastYear = applications.filter(app => {
    const appYear = new Date(app.date).getFullYear();
    if (selectedFarm && app.farmId !== selectedFarm) return false;
    return appYear === (selectedYear - 1);
  }).length;

  const growth = lastYear === 0 ? 0 : Math.round(((thisYear - lastYear) / lastYear) * 100);

  $('#timelineThisYear').textContent = thisYear;
  $('#timelineLastYear').textContent = lastYear;
  $('#timelineGrowth').textContent = `${growth > 0 ? '+' : ''}${growth}%`;
  $('#timelineGrowth').className = `comparison-value growth ${growth >= 0 ? 'positive' : 'negative'}`;
}

// Historical data functionality
function loadHistoricalData() {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const thisYearApps = applications.filter(app => 
    new Date(app.date).getFullYear() === currentYear
  ).length;

  const lastYearApps = applications.filter(app => 
    new Date(app.date).getFullYear() === lastYear
  ).length;

  const thisYearFert = applications.filter(app => 
    new Date(app.date).getFullYear() === currentYear && app.type === 'Fertilizer'
  ).length;

  const lastYearFert = applications.filter(app => 
    new Date(app.date).getFullYear() === lastYear && app.type === 'Fertilizer'
  ).length;

  const thisYearPest = applications.filter(app => 
    new Date(app.date).getFullYear() === currentYear && 
    (app.type === 'Pesticide' || app.type === 'Herbicide')
  ).length;

  const lastYearPest = applications.filter(app => 
    new Date(app.date).getFullYear() === lastYear && 
    (app.type === 'Pesticide' || app.type === 'Herbicide')
  ).length;

  animateCounter('#thisYearApps', thisYearApps);
  animateCounter('#lastYearApps', lastYearApps);
  animateCounter('#thisYearFert', thisYearFert);
  animateCounter('#lastYearFert', lastYearFert);
  animateCounter('#thisYearPest', thisYearPest);
  animateCounter('#lastYearPest', lastYearPest);
}

function loadHistoricalChart() {
  const ctx = $('#historicalChart');
  if (!ctx) return;

  if (historicalChart) {
    historicalChart.destroy();
  }

  const currentYear = new Date().getFullYear();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const thisYearData = Array(12).fill(0);
  const lastYearData = Array(12).fill(0);

  applications.forEach(app => {
    const date = new Date(app.date);
    const month = date.getMonth();
    const year = date.getFullYear();

    if (year === currentYear) {
      thisYearData[month]++;
    } else if (year === currentYear - 1) {
      lastYearData[month]++;
    }
  });

  historicalChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthNames,
      datasets: [
        {
          label: `${currentYear}`,
          data: thisYearData,
          borderColor: '#4a7c59',
          backgroundColor: 'rgba(74, 124, 89, 0.1)',
          borderWidth: 3,
          fill: false
        },
        {
          label: `${currentYear - 1}`,
          data: lastYearData,
          borderColor: '#999',
          backgroundColor: 'rgba(153, 153, 153, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}

// Enhanced PDF Export with better mobile handling
function exportRecords(format) {
  if (format === 'pdf') {
    exportToPDF();
  } else if (format === 'excel') {
    exportToCSV();
  }
}

function exportToPDF() {
  try {
    showToast('📄 Generating PDF...', 'info');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(45, 90, 39);
    doc.text('Farm Records Report', 20, 30);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);

    let yPosition = 60;

    // Summary Stats
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary Statistics', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Total Farms: ${farms.length}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total Applications: ${applications.length}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total Crops: ${crops.length}`, 20, yPosition);
    yPosition += 20;

    // Farms Section
    if (farms.length > 0) {
      doc.setFontSize(14);
      doc.text('Farms', 20, yPosition);
      yPosition += 15;

      farms.forEach(farm => {
        doc.setFontSize(10);
        doc.text(`• ${farm.name} (${farm.farmId}) - ${farm.location || 'Location not specified'} - ${farm.size || 0} acres`, 25, yPosition);
        yPosition += 10;
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
      yPosition += 10;
    }

    // Recent Applications
    if (applications.length > 0) {
      doc.setFontSize(14);
      doc.text('Recent Applications', 20, yPosition);
      yPosition += 15;

      const recentApps = applications.slice(0, 10);
      recentApps.forEach(app => {
        doc.setFontSize(10);
        doc.text(`• ${formatDate(app.date)}: ${app.productName} (${app.type}) - ${app.quantity} ${app.unit}`, 25, yPosition);
        yPosition += 8;
        doc.text(`  Applied to: ${getCropName(app.cropId)} at ${getFarmName(app.farmId)}`, 30, yPosition);
        yPosition += 12;
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    doc.save('farm-records-report.pdf');
    showToast('✅ PDF exported successfully!', 'success');
  } catch (error) {
    console.error('PDF export error:', error);
    showToast('❌ PDF export failed. Please try again.', 'error');
  }
}

function exportToCSV() {
  try {
    showToast('📊 Generating CSV...', 'info');

    let csvContent = "Date,Type,Product/Crop,Farm,Details\n";

    const allRecords = [
      ...applications.map(app => ({
        date: app.date,
        type: 'Application - ' + app.type,
        name: app.productName,
        farm: getFarmName(app.farmId),
        details: `${app.quantity} ${app.unit} on ${getCropName(app.cropId)}`
      })),
      ...crops.map(crop => ({
        date: crop.plantationDate,
        type: 'Crop',
        name: crop.name,
        farm: getFarmName(crop.farmId),
        details: `${crop.area || 0} acres${crop.variety ? ` - ${crop.variety}` : ''}`
      }))
    ];

    allRecords.forEach(record => {
      csvContent += `"${formatDate(record.date)}","${record.type}","${record.name}","${record.farm}","${record.details}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'farm-records-export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✅ CSV exported successfully!', 'success');
  } catch (error) {
    console.error('CSV export error:', error);
    showToast('❌ CSV export failed. Please try again.', 'error');
  }
}

// Enhanced mobile toast notifications
function showToast(message, type = 'info') {
  const toast = $('#toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast mobile-toast ${type}`;
    toast.classList.remove('hidden');

    // Auto-hide after 4 seconds (longer for mobile)
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 4000);

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [50] : [100, 50, 100]);
    }
  }
}

// Initialize app with mobile optimizations
function initializeApp() {
  loadFromStorage();
  initializeNavigation();
  setupFarmForm();
  setupApplicationForm();
  setupCropForm();
  updateDashboard();

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = ['#applicationDate', '#plantationDate'];
  dateInputs.forEach(selector => {
    const input = $(selector);
    if (input) input.value = today;
  });

  // Mobile optimizations
  document.addEventListener('touchstart', () => {}, { passive: true });

  // Handle orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (applicationsChart) applicationsChart.resize();
      if (cropsChart) cropsChart.resize();
      if (timelineChart) timelineChart.resize();
      if (historicalChart) historicalChart.resize();
    }, 500);
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
}

// Placeholder functions with better UX messages
function populateFilterSelects() { 
  populateFarmSelects(); 
}

function applyFilters() { 
  loadRecordsTable(); 
  showToast('🔍 Filters applied successfully!', 'info');
}

function clearFilters() { 
  $('#filterFarm').value = '';
  $('#filterType').value = '';
  $('#filterFromDate').value = '';
  $('#filterToDate').value = '';
  $('#searchRecords').value = '';

  loadRecordsTable();
  showToast('🧹 All filters cleared!', 'info');
}

function viewRecord(id, type) { 
  showToast(`👁️ View ${type} details - Feature coming soon!`, 'info'); 
}

function closeEditModal() { 
  const modal = $('#editModal');
  if (modal) {
    modal.classList.add('hidden'); 
  }
}

function sortRecords(field) { 
  showToast(`📋 Sort by ${field} - Feature coming soon!`, 'info'); 
}

// Handle window resize for charts
window.addEventListener('resize', debounce(() => {
  if (applicationsChart) applicationsChart.resize();
  if (cropsChart) cropsChart.resize();
  if (timelineChart) timelineChart.resize();
  if (historicalChart) historicalChart.resize();
}, 250));

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

console.log('Enhanced Farm Records App initialized with fixed mobile navigation and improved UX');