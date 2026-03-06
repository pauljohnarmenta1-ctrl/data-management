const API_BASE = 'http://localhost:3000';

let propertyRecords = [];
let transactions = [];
let taxMappings = [];
let currentEditId = null;
let currentDeleteType = null;
let currentDeleteId = null;
let currentExportType = null;
const pageSize = 10;
let sortConfig = {
    'property-records': { column: null, direction: 'asc' },
    'transactions': { column: null, direction: 'asc' },
    'taxmapping': { column: null, direction: 'asc' }
};

// ==================== API HELPER ====================
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(API_BASE + endpoint, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
}

// ==================== LOAD ALL DATA FROM MYSQL ====================
async function loadAllData() {
    try {
        propertyRecords = await apiRequest('/api/property-records');
        transactions = await apiRequest('/api/transactions');
        taxMappings = await apiRequest('/api/tax-mappings');
        return true;
    } catch (e) {
        showToast('Cannot connect to database. Is the server running?', 'error');
        return false;
    }
}

// ==================== LOGIN ====================
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        await apiRequest('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');

        await loadAllData();
        updateDashboardStats();
        renderRecentActivity();
        navigateTo('dashboard');
        showToast('Welcome back, Admin!', 'success');
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch (err) {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = 'Invalid username or password';
        errorEl.classList.remove('hidden');
        setTimeout(() => errorEl.classList.add('hidden'), 3000);
    }
}

// ==================== SAVE / UPDATE PROPERTY ====================
async function saveProperty() {
    const owner = document.getElementById('p-owner').value.trim();
    const lot = document.getElementById('p-lot').value.trim();
    if (!validateField('p-owner', owner) || !validateField('p-lot', lot)) return;

    const payload = {
        owner_name: owner,
        lot_number: lot,
        title_number: document.getElementById('p-title').value.trim(),
        location: document.getElementById('p-location').value.trim(),
        transaction_type: document.getElementById('p-type').value,
        status: document.getElementById('p-status').value,
        created_at: currentEditId 
            ? propertyRecords.find(r => r.id === currentEditId).created_at 
            : new Date().toISOString().split('T')[0]
    };

    try {
        let saved;
        if (currentEditId) {
            saved = await apiRequest(`/api/property-records/${currentEditId}`, { method: 'PUT', body: JSON.stringify(payload) });
            const idx = propertyRecords.findIndex(r => r.id === currentEditId);
            if (idx !== -1) propertyRecords[idx] = saved;
        } else {
            saved = await apiRequest('/api/property-records', { method: 'POST', body: JSON.stringify(payload) });
            propertyRecords.unshift(saved);
        }
        hidePropertyModal();
        filterPropertyRecords();
        updateDashboardStats();
        renderRecentActivity();
        showToast(currentEditId ? 'Record updated' : 'New record created', 'success');
    } catch (e) {
        showToast('Failed to save record', 'error');
    }
}

// ==================== SAVE TAX MAPPING ====================
async function saveTaxMapping() {
    const owner = document.getElementById('tax-owner').value.trim();
    const lot = document.getElementById('tax-lot').value.trim();
    if (!validateField('tax-owner', owner) || !validateField('tax-lot', lot)) return;

    const payload = {
        owner_name: owner,
        lot_number: lot,
        received_date: document.getElementById('tax-received').value,
        released_date: '',
        status: document.getElementById('tax-status').value
    };

    try {
        let saved;
        if (currentEditId) {
            saved = await apiRequest(`/api/tax-mappings/${currentEditId}`, { method: 'PUT', body: JSON.stringify(payload) });
            const idx = taxMappings.findIndex(t => t.id === currentEditId);
            if (idx !== -1) taxMappings[idx] = saved;
        } else {
            saved = await apiRequest('/api/tax-mappings', { method: 'POST', body: JSON.stringify(payload) });
            taxMappings.unshift(saved);
        }
        hideTaxModal();
        filterTaxMapping();
        updateDashboardStats();
        renderRecentActivity();
        showToast(currentEditId ? 'Request updated' : 'New request created', 'success');
    } catch (e) {
        showToast('Failed to save request', 'error');
    }
}

// ==================== DELETE ====================
async function confirmDelete() {
    try {
        if (currentDeleteType === 'property-records') {
            await apiRequest(`/api/property-records/${currentDeleteId}`, { method: 'DELETE' });
            propertyRecords = propertyRecords.filter(r => r.id !== currentDeleteId);
            filterPropertyRecords();
        } else if (currentDeleteType === 'transactions') {
            await apiRequest(`/api/transactions/${currentDeleteId}`, { method: 'DELETE' });
            transactions = transactions.filter(r => r.id !== currentDeleteId);
            filterTransactions();
        } else if (currentDeleteType === 'taxmapping') {
            await apiRequest(`/api/tax-mappings/${currentDeleteId}`, { method: 'DELETE' });
            taxMappings = taxMappings.filter(t => t.id !== currentDeleteId);
            filterTaxMapping();
        }
        hideDeleteModal();
        updateDashboardStats();
        renderRecentActivity();
        showToast('Record deleted successfully', 'success');
    } catch (e) {
        showToast('Delete failed', 'error');
    }
}

// Keep all other functions (render*, filter*, navigateTo, showToast, etc.) exactly the same as your current main.js
// (They only read the arrays, which we now update from the database)

window.onload = () => {
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    console.log('%c🚀 Municipal Assessor Management System (MySQL) ready!', 'color:#1e3a8a; font-weight:700');
};