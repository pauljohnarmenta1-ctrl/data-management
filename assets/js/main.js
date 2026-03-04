// Data stores and pagination
let propertyRecords = []; // former propertyTransactions
let transactions = []; // former recordsManagement
let taxMappings = [];
let currentEditId = null;
let currentDeleteType = null;
let currentDeleteId = null;
let currentExportType = null;
const pageSize = 10;
let sortConfig = { 'property-records': { column: null, direction: 'asc' }, 'transactions': { column: null, direction: 'asc' }, 'taxmapping': { column: null, direction: 'asc' } };

// Sample Data
function getSampleData() {
    const today = new Date().toISOString().split('T')[0];
   
    propertyRecords = [
        { id: 1, owner_name: "Juan Dela Cruz", lot_number: "LOT-2023-045", title_number: "T-123456", location: "Brgy. Balibago", transaction_type: "Sale", status: "Pending", created_at: "2026-02-20" },
        { id: 2, owner_name: "Maria Santos", lot_number: "LOT-2023-112", title_number: "T-987654", location: "Brgy. Dila", transaction_type: "Transfer", status: "Processing", created_at: "2026-02-18" },
        { id: 3, owner_name: "Pedro Reyes", lot_number: "LOT-2024-008", title_number: "T-555444", location: "Brgy. Tagapo", transaction_type: "Subdivision", status: "Released", created_at: "2026-02-10" }
    ];
   
    transactions = [
        { id: 1, owner_name: "Juan Dela Cruz", received_date: "2026-02-15", released_date: "", action_taken: "Initial review completed. Awaiting payment.", status: "Pending" },
        { id: 2, owner_name: "Maria Santos", received_date: "2026-02-12", released_date: "2026-02-22", action_taken: "All requirements satisfied. Document released.", status: "Released" }
    ];
   
    taxMappings = [
        { id: 1, owner_name: "Ana Lopez", lot_number: "LOT-2023-067", received_date: "2026-02-19", released_date: "", status: "Pending" },
        { id: 2, owner_name: "Carlos Mendoza", lot_number: "LOT-2024-015", received_date: "2026-02-05", released_date: "2026-02-25", status: "Completed" }
    ];
}
 
function saveToLocalStorage() {
    localStorage.setItem('propertyRecords', JSON.stringify(propertyRecords));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('taxMappings', JSON.stringify(taxMappings));
}
 
function loadFromLocalStorage() {
    const pr = localStorage.getItem('propertyRecords');
    if (pr) propertyRecords = JSON.parse(pr);
   
    const tr = localStorage.getItem('transactions');
    if (tr) transactions = JSON.parse(tr);
   
    const tm = localStorage.getItem('taxMappings');
    if (tm) taxMappings = JSON.parse(tm);
}
 
// Navigation
function navigateTo(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section + '-section').classList.remove('hidden');
   
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('sidebar-link-active');
        if (link.getAttribute('onclick').includes(section)) {
            link.classList.add('sidebar-link-active');
        }
    });
   
    document.getElementById('page-title').textContent = {
        'dashboard': 'Dashboard Overview',
        'property-records': 'Property Records',
        'transactions': 'Transactions',
        'taxmapping': 'Tax Mapping & Appraisal',
        'reports': 'Reports'
    }[section];
   
    if (section === 'property-records') renderPropertyRecordsTable(1);
    if (section === 'transactions') renderTransactionsTable(1);
    if (section === 'taxmapping') renderTaxTable(1);
}
 
// Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const msg = document.getElementById('toast-message');
   
    msg.textContent = message;
   
    let bgClass = 'bg-gray-800 text-white';
    let iconClass = 'fa-info-circle';
   
    if (type === 'success') {
        bgClass = 'bg-green-600 text-white';
        iconClass = 'check_circle';
    } else if (type === 'error') {
        bgClass = 'bg-red-600 text-white';
        iconClass = 'error';
    } else if (type === 'info') {
        bgClass = 'bg-blue-600 text-white';
        iconClass = 'info';
    }
   
    toast.className = `fixed bottom-6 right-6 ${bgClass} px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 toast`;
    icon.innerHTML = `<span class="material-symbols-outlined">${iconClass}</span>`;
   
    toast.classList.remove('hidden');
   
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
 
// Login
function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
   
    if (username === 'admin' && password === 'admin') {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
       
        loadFromLocalStorage();
        if (propertyRecords.length === 0) getSampleData();
        saveToLocalStorage();
       
        updateDashboardStats();
        renderRecentActivity();
       
        navigateTo('dashboard');
        showToast('Welcome back, Admin!', 'success');
       
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } else {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = 'Invalid username or password';
        errorEl.classList.remove('hidden');
       
        setTimeout(() => errorEl.classList.add('hidden'), 3000);
    }
}
 
function togglePassword() {
    const passInput = document.getElementById('password');
    const eye = document.getElementById('eye-icon');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        eye.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passInput.type = 'password';
        eye.classList.replace('fa-eye-slash', 'fa-eye');
    }
}
 
function forgotPassword() {
    showToast('Contact the IT administrator for password reset.', 'info');
}
 
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('password').value = '';
        localStorage.removeItem('ma_user');
    }
}

function showLogoutModal() {
    document.getElementById('logout-modal').classList.remove('hidden');
}

function hideLogoutModal() {
    document.getElementById('logout-modal').classList.add('hidden');
}

function confirmLogout() {
    hideLogoutModal();
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('password').value = '';
    localStorage.removeItem('ma_user');
    showToast('You have been logged out successfully', 'success');
}

// sidebar collapse/expand
function toggleSidebar() {
    const sidebar = document.querySelector('.professional-sidebar');
    sidebar.classList.toggle('collapsed');
    // adjust main-app padding
    const main = document.getElementById('main-app');
    if (sidebar.classList.contains('collapsed')) {
        main.classList.add('pl-20');
        main.classList.remove('pl-72');
    } else {
        main.classList.add('pl-72');
        main.classList.remove('pl-20');
    }
}

// mobile sidebar open/close
function setSidebarMobile(open) {
    const sidebar = document.querySelector('.professional-sidebar');
    if (open) sidebar.classList.add('open');
    else sidebar.classList.remove('open');
}

// close sidebar when clicking outside on mobile
window.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.professional-sidebar');
    if (window.innerWidth < 768 && !sidebar.contains(e.target) && !e.target.closest('#sidebar-toggle')) {
        setSidebarMobile(false);
    }
});

 
function showNotifications() {
    showToast('No new notifications', 'info');
}
 
// Dashboard
function updateDashboardStats() {
    document.getElementById('stat-total').textContent = propertyRecords.length;
    
    const owners = new Set(propertyRecords.map(r => r.owner_name));
    document.getElementById('stat-owners').textContent = owners.size;
    
    document.getElementById('stat-pending').textContent = transactions.filter(t => t.status === 'Pending').length;
    
    document.getElementById('stat-value').textContent = '₱2.4B';
    
    renderDashboardRecentTransactions();
}

function renderDashboardRecentTransactions() {
    const container = document.getElementById('dashboard-recent-table');
    if (!container) return;
    container.innerHTML = '';
    
    // Use original data from propertyRecords and transactions
    const allActivities = [];
    
    // Add property records to activities
    propertyRecords.forEach(rec => {
        allActivities.push({
            id: `PROP-${rec.id}`,
            action: rec.transaction_type,
            property: rec.lot_number,
            owner: rec.owner_name,
            type: rec.transaction_type,
            date: rec.created_at,
            status: rec.status.toLowerCase()
        });
    });
    
    // Add transactions to activities
    transactions.forEach(trans => {
        allActivities.push({
            id: `TXN-${trans.id}`,
            action: trans.status === 'Released' ? 'Document Released' : 'Transaction Updated',
            property: '-',
            owner: trans.owner_name,
            type: 'Transaction',
            date: trans.released_date || trans.received_date,
            status: trans.status.toLowerCase()
        });
    });
    
    // Sort by date (newest first) and limit to 5
    allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const displayActivities = allActivities.slice(0, 5);
    
    const statusConfig = {
        pending: { label: 'Pending', bg: 'bg-amber-100', color: 'text-amber-600' },
        released: { label: 'Released', bg: 'bg-green-100', color: 'text-green-600' },
        processing: { label: 'Processing', bg: 'bg-blue-100', color: 'text-blue-600' },
        transaction: { label: 'Transaction', bg: 'bg-purple-100', color: 'text-purple-600' }
    };
    
    if (displayActivities.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="py-12 text-center text-gray-400">No activities yet</td></tr>';
        return;
    }
    
    displayActivities.forEach(row => {
        const statusCfg = statusConfig[row.status] || { label: row.status, bg: 'bg-gray-100', color: 'text-gray-600' };
        
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50 transition-colors";
        tr.innerHTML = `
            <td class="py-4 px-6 font-mono text-xs text-blue-600 font-600">${row.id}</td>
            <td class="py-4 px-6 text-sm text-gray-700">${row.action}</td>
            <td class="py-4 px-6 text-sm text-gray-700">${row.property}</td>
            <td class="py-4 px-6 text-sm text-gray-600">${row.owner}</td>
            <td class="py-4 px-6">
                <span class="badge badge-${row.type.toLowerCase()}">
                    ${row.type}
                </span>
            </td>
            <td class="py-4 px-6 text-xs text-gray-500">${row.date}</td>
            <td class="py-4 px-6 text-center">
                <span class="badge ${statusCfg.label.toLowerCase() === 'completed' ? 'badge-completed' : statusCfg.label.toLowerCase() === 'updated' ? 'badge-updated' : 'badge-pending'}">
                    ${statusCfg.label}
                </span>
            </td>
        `;
        container.appendChild(tr);
    });
}

 
function renderRecentActivity() {
    const container = document.getElementById('recent-activity');
    container.innerHTML = '';
   
    let allActivity = [];
   
    propertyRecords.slice(0, 3).forEach(t => {
        allActivity.push({
            type: 'property',
            owner: t.owner_name,
            action: `${t.transaction_type} • ${t.status}`,
            date: t.created_at,
            icon: 'description'
        });
    });
   
    transactions.slice(0, 2).forEach(r => {
        allActivity.push({
            type: 'transaction',
            owner: r.owner_name,
            action: r.status === 'Released' ? 'Document Released' : 'Transaction Updated',
            date: r.released_date || r.received_date,
            icon: 'folder_open'
        });
    });
   
    allActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
   
    allActivity.slice(0, 5).forEach(item => {
        const div = document.createElement('div');
        div.className = "flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0";
        div.innerHTML = `
            <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined">${item.icon}</span>
            </div>
            <div class="flex-1">
                <div class="font-medium">${item.owner}</div>
                <div class="text-sm text-gray-500">${item.action}</div>
            </div>
            <div class="text-xs text-gray-400 whitespace-nowrap">${item.date}</div>
        `;
        container.appendChild(div);
    });
}

// Property Records
function renderPropertyRecordsTable(page = 1, filtered = null) {
    const tbody = document.getElementById('property-records-table');
    tbody.innerHTML = '';
   
    let data = filtered || [...propertyRecords];
   
    if (sortConfig['property-records'].column) {
        data.sort((a, b) => {
            let valA = a[sortConfig['property-records'].column] || '';
            let valB = b[sortConfig['property-records'].column] || '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortConfig['property-records'].direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig['property-records'].direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
   
    const totalPages = Math.ceil(data.length / pageSize);
    const start = (page - 1) * pageSize;
    data = data.slice(start, start + pageSize);
   
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-gray-400">No records found</td></tr>`;
    } else {
        data.forEach(rec => {
            const tr = document.createElement('tr');
            tr.className = "border-b hover:bg-gray-50 transition-colors";
            tr.innerHTML = `
                <td class="py-5 px-8 font-medium">${rec.owner_name}</td>
                <td class="py-5 px-8 text-gray-600">${rec.lot_number}</td>
                <td class="py-5 px-8 text-gray-600">${rec.title_number || '-'}</td>
                <td class="py-5 px-8">
                    <span class="badge badge-${rec.transaction_type.toLowerCase()}">${rec.transaction_type}</span>
                </td>
                <td class="py-5 px-8 text-gray-500">${rec.created_at}</td>
                <td class="py-5 px-8 text-center">
                    <span class="badge ${rec.status === 'Pending' ? 'badge-pending' : rec.status === 'Processing' ? 'badge-processing' : 'badge-released'}">
                        ${rec.status}
                    </span>
                </td>
                <td class="py-5 px-8">
                    <div class="flex gap-3 justify-end">
                        <button onclick="editProperty(${rec.id})" class="text-blue-500 hover:text-blue-600"><span class="material-symbols-outlined">edit</span></button>
                        <button onclick="deleteItem('property-records', ${rec.id})" class="text-red-500 hover:text-red-600"><span class="material-symbols-outlined">delete</span></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
   
    renderPagination('property-records', page, totalPages, data.length, filterPropertyRecords);
}
 
function filterPropertyRecords(page = 1) {
    const search = document.getElementById('property-search').value.toLowerCase().trim();
    const statusFilter = document.getElementById('property-status-filter').value;
   
    let filtered = propertyRecords.filter(rec => {
        const matchesSearch = rec.owner_name.toLowerCase().includes(search) || rec.lot_number.toLowerCase().includes(search);
        const matchesStatus = statusFilter ? rec.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });
   
    renderPropertyRecordsTable(page, filtered);
}
 
function showPropertyModal(editData = null) {
    currentEditId = editData ? editData.id : null;
    document.getElementById('property-modal-title').textContent = editData ? 'Edit Property Record' : 'New Property Record';
    document.getElementById('save-property-btn').textContent = editData ? 'Update Record' : 'Save Record';
   
    if (editData) {
        document.getElementById('p-owner').value = editData.owner_name;
        document.getElementById('p-lot').value = editData.lot_number;
        document.getElementById('p-title').value = editData.title_number || '';
        document.getElementById('p-location').value = editData.location || '';
        document.getElementById('p-type').value = editData.transaction_type;
        document.getElementById('p-status').value = editData.status;
    } else {
        document.getElementById('p-owner').value = '';
        document.getElementById('p-lot').value = '';
        document.getElementById('p-title').value = '';
        document.getElementById('p-location').value = '';
        document.getElementById('p-type').value = 'Transfer';
        document.getElementById('p-status').value = 'Pending';
    }
   
    hideFieldErrors('p');
    document.getElementById('property-modal').classList.remove('hidden');
    document.getElementById('p-owner').focus();
}
 
function hidePropertyModal() {
    document.getElementById('property-modal').classList.add('hidden');
}
 
function saveProperty() {
    const owner = document.getElementById('p-owner').value.trim();
    const lot = document.getElementById('p-lot').value.trim();
   
    if (!validateField('p-owner', owner) || !validateField('p-lot', lot)) {
        return;
    }
   
    const newRec = {
        id: currentEditId || Date.now(),
        owner_name: owner,
        lot_number: lot,
        title_number: document.getElementById('p-title').value.trim(),
        location: document.getElementById('p-location').value.trim(),
        transaction_type: document.getElementById('p-type').value,
        status: document.getElementById('p-status').value,
        created_at: currentEditId ? propertyRecords.find(r => r.id === currentEditId).created_at : new Date().toISOString().split('T')[0]
    };
   
    if (currentEditId) {
        const oldRec = propertyRecords.find(r => r.id === currentEditId);
        const index = propertyRecords.findIndex(r => r.id === currentEditId);
        propertyRecords[index] = newRec;
        showToast('Record updated successfully', 'success');
    } else {
        propertyRecords.unshift(newRec);
        showToast('New record created', 'success');
    }
   
    saveToLocalStorage();
    hidePropertyModal();
    filterPropertyRecords();
    updateDashboardStats();
    renderRecentActivity();
}
 
function editProperty(id) {
    const rec = propertyRecords.find(r => r.id === id);
    if (rec) showPropertyModal(rec);
}
 
function exportCurrentProperty() {
    const owner = document.getElementById('p-owner').value.trim();
    const lot = document.getElementById('p-lot').value.trim();
   
    if (!validateField('p-owner', owner) || !validateField('p-lot', lot)) {
        return;
    }
   
    const data = {
        owner_name: owner,
        lot_number: lot,
        title_number: document.getElementById('p-title').value.trim() || '-',
        location: document.getElementById('p-location').value.trim() || '-',
        transaction_type: document.getElementById('p-type').value,
        status: document.getElementById('p-status').value,
        created_at: new Date().toISOString().split('T')[0]
    };
   
    generatePDF('Property Record Report', [data], ['Owner Name', 'Lot Number', 'Title Number', 'Location', 'Type', 'Date Filed', 'Status']);
    showToast('PDF exported successfully', 'success');
}
 
// Transactions
function renderTransactionsTable(page = 1, filtered = null) {
    const tbody = document.getElementById('transactions-table');
    tbody.innerHTML = '';
   
    let data = filtered || [...transactions];
   
    if (sortConfig['transactions'].column) {
        data.sort((a, b) => {
            let valA = a[sortConfig['transactions'].column] || '';
            let valB = b[sortConfig['transactions'].column] || '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortConfig['transactions'].direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig['transactions'].direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
   
    const totalPages = Math.ceil(data.length / pageSize);
    const start = (page - 1) * pageSize;
    data = data.slice(start, start + pageSize);
   
    data.forEach(rec => {
        const statusClass = rec.status === 'Released' ? 'badge-released' : 'badge-pending';
       
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-5 px-8 font-medium">${rec.owner_name}</td>
            <td class="py-5 px-8">${rec.received_date}</td>
            <td class="py-5 px-8">${rec.released_date || '-'}</td>
            <td class="py-5 px-8 text-center">
                <span class="badge ${statusClass}">${rec.status}</span>
            </td>
            <td class="py-5 px-8 text-gray-600 max-w-xs truncate">${rec.action_taken}</td>
            <td class="py-5 px-8">
                <button onclick="deleteItem('transactions', ${rec.id})"
                        class="text-red-500 hover:text-red-600"><span class="material-symbols-outlined">delete</span></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
   
    renderPagination('transactions', page, totalPages, data.length, filterTransactions);
}
 
function filterTransactions(page = 1) {
    const term = document.getElementById('transactions-search').value.toLowerCase();
    const filtered = transactions.filter(r => r.owner_name.toLowerCase().includes(term));
    renderTransactionsTable(page, filtered);
}
 
// Tax Mapping
function renderTaxTable(page = 1, filtered = null) {
    const tbody = document.getElementById('tax-table');
    tbody.innerHTML = '';
   
    let data = filtered || [...taxMappings];
   
    if (sortConfig['taxmapping'].column) {
        data.sort((a, b) => {
            let valA = a[sortConfig['taxmapping'].column] || '';
            let valB = b[sortConfig['taxmapping'].column] || '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortConfig['taxmapping'].direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig['taxmapping'].direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
   
    const totalPages = Math.ceil(data.length / pageSize);
    const start = (page - 1) * pageSize;
    data = data.slice(start, start + pageSize);
   
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-5 px-8 font-medium">${item.owner_name}</td>
            <td class="py-5 px-8">${item.lot_number}</td>
            <td class="py-5 px-8">${item.received_date}</td>
            <td class="py-5 px-8">${item.released_date || '-'}</td>
            <td class="py-5 px-8 text-center">
                <span class="badge ${item.status === 'Completed' ? 'badge-completed' : 'badge-pending'}">
                    ${item.status}
                </span>
            </td>
            <td class="py-5 px-8">
                <button onclick="deleteItem('taxmapping', ${item.id})"
                        class="text-red-500 hover:text-red-600"><span class="material-symbols-outlined">delete</span></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
   
    renderPagination('taxmapping', page, totalPages, data.length, filterTaxMapping);
}
 
function filterTaxMapping(page = 1) {
    const term = document.getElementById('tax-search').value.toLowerCase();
    const filtered = taxMappings.filter(t =>
        t.owner_name.toLowerCase().includes(term) || t.lot_number.toLowerCase().includes(term)
    );
    renderTaxTable(page, filtered);
}
 
function showTaxModal(editData = null) {
    currentEditId = editData ? editData.id : null;
   
    if (editData) {
        document.getElementById('tax-owner').value = editData.owner_name;
        document.getElementById('tax-lot').value = editData.lot_number;
        document.getElementById('tax-received').value = editData.received_date;
        document.getElementById('tax-status').value = editData.status;
    } else {
        document.getElementById('tax-owner').value = '';
        document.getElementById('tax-lot').value = '';
        document.getElementById('tax-received').value = new Date().toISOString().split('T')[0];
        document.getElementById('tax-status').value = 'Pending';
    }
   
    hideFieldErrors('tax');
    document.getElementById('tax-modal').classList.remove('hidden');
}
 
function hideTaxModal() {
    document.getElementById('tax-modal').classList.add('hidden');
}
 
function saveTaxMapping() {
    const owner = document.getElementById('tax-owner').value.trim();
    const lot = document.getElementById('tax-lot').value.trim();
   
    if (!validateField('tax-owner', owner) || !validateField('tax-lot', lot)) {
        return;
    }
   
    const newTax = {
        id: currentEditId || Date.now(),
        owner_name: owner,
        lot_number: lot,
        received_date: document.getElementById('tax-received').value,
        released_date: '',
        status: document.getElementById('tax-status').value
    };
   
    if (currentEditId) {
        const oldTax = taxMappings.find(t => t.id === currentEditId);
        const index = taxMappings.findIndex(t => t.id === currentEditId);
        taxMappings[index] = newTax;
        showToast('Request updated successfully', 'success');
    } else {
        taxMappings.unshift(newTax);
        showToast('New request created', 'success');
    }
   
    saveToLocalStorage();
    hideTaxModal();
    filterTaxMapping();
    updateDashboardStats();
    renderRecentActivity();
}
 
function exportCurrentTax() {
    const owner = document.getElementById('tax-owner').value.trim();
    const lot = document.getElementById('tax-lot').value.trim();
   
    if (!validateField('tax-owner', owner) || !validateField('tax-lot', lot)) {
        return;
    }
   
    const data = {
        owner_name: owner,
        lot_number: lot,
        received_date: document.getElementById('tax-received').value,
        released_date: '-',
        status: document.getElementById('tax-status').value
    };
   
    generatePDF('Tax Mapping Report', [data], ['Owner Name', 'Lot Number', 'Received Date', 'Released Date', 'Status']);
    showToast('PDF exported successfully', 'success');
}
 
// General functions
function validateField(fieldId, value) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + '-error');
    if (!value) {
        input.classList.add('border-red-500');
        error.style.display = 'block';
        return false;
    } else {
        input.classList.remove('border-red-500');
        error.style.display = 'none';
        return true;
    }
}
 
function hideFieldErrors(prefix) {
    document.querySelectorAll(`[id^="${prefix}-"][id$="-error"]`).forEach(el => el.style.display = 'none');
    document.querySelectorAll(`[id^="${prefix}-"]`).forEach(input => input.classList.remove('border-red-500'));
}
 
function sortTable(column, section) {
    const config = sortConfig[section];
    if (config.column === column) {
        config.direction = config.direction === 'asc' ? 'desc' : 'asc';
    } else {
        config.column = column;
        config.direction = 'asc';
    }
   
    if (section === 'property-records') filterPropertyRecords();
    if (section === 'transactions') filterTransactions();
    if (section === 'taxmapping') filterTaxMapping();
}
 
function renderPagination(section, currentPage, totalPages, currentLength, filterFunc) {
    const container = document.getElementById(section + '-pagination');
    container.innerHTML = '';
   
    if (totalPages <= 1) return;
   
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.className = 'px-4 py-2 border border-gray-300 rounded-lg text-sm font-500 ' + (prevBtn.disabled ? 'text-gray-400 bg-gray-50' : 'text-gray-700 hover:bg-gray-50');
    prevBtn.onclick = () => filterFunc(currentPage - 1);
   
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.className = 'px-4 py-2 border border-gray-300 rounded-lg text-sm font-500 ' + (nextBtn.disabled ? 'text-gray-400 bg-gray-50' : 'text-gray-700 hover:bg-gray-50');
    nextBtn.onclick = () => filterFunc(currentPage + 1);
   
    const span = document.createElement('span');
    span.textContent = `Page ${currentPage} of ${totalPages} (${currentLength} items)`;
   
    container.appendChild(prevBtn);
    container.appendChild(span);
    container.appendChild(nextBtn);
}
 
function deleteItem(type, id) {
    currentDeleteType = type;
    currentDeleteId = id;
    document.getElementById('delete-modal').classList.remove('hidden');
}
 
function hideDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
}
 
function confirmDelete() {
    if (currentDeleteType === 'property-records') {
        propertyRecords = propertyRecords.filter(r => r.id !== currentDeleteId);
        filterPropertyRecords();
    } else if (currentDeleteType === 'transactions') {
        transactions = transactions.filter(r => r.id !== currentDeleteId);
        filterTransactions();
    } else if (currentDeleteType === 'taxmapping') {
        taxMappings = taxMappings.filter(t => t.id !== currentDeleteId);
        filterTaxMapping();
    }
   
    saveToLocalStorage();
    updateDashboardStats();
    hideDeleteModal();
    showToast('Record deleted successfully', 'success');
}
 
function showExportModal(type) {
    currentExportType = type;
    document.getElementById('export-modal').classList.remove('hidden');
}
 
function hideExportModal() {
    document.getElementById('export-modal').classList.add('hidden');
}
 
function confirmExport() {
    hideExportModal();
    if (currentExportType === 'property-records') {
        exportPropertyRecordsToPDF();
    } else if (currentExportType === 'transactions') {
        exportTransactionsToPDF();
    } else if (currentExportType === 'taxmapping') {
        exportTaxMappingToPDF();
    }
}
 
function generatePDF(title, data, headers) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
   
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Municipal Assessor Office", 105, 20, { align: "center" });
    doc.text(title, 105, 30, { align: "center" });
   
    // Ref No
    const refNo = 'REF-' + new Date().toISOString().slice(0,10).replace(/-/g, '');
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Reference No: ${refNo}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString('en-PH')}`, 20, 52);
   
    // Table
    let y = 70;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 10;
   
    // Headers
    doc.setFont("helvetica", "bold");
    headers.forEach((header, i) => {
        doc.text(header, 20 + i * 40, y - 3);
    });
   
    doc.setFont("helvetica", "normal");
    data.forEach(row => {
        y += 10;
        if (y > 260) {
            doc.addPage();
            y = 30;
        }
        Object.values(row).forEach((val, i) => {
            doc.text(String(val || '-'), 20 + i * 40, y);
        });
    });
   
    // Signature
    y = Math.max(y + 30, 240);
    doc.text("___________________________", 140, y);
    doc.text("Municipal Assessor", 150, y + 10);
   
    // Footer
    doc.setFontSize(8);
    doc.text("Generated by Municipal Assessor System on " + new Date().toLocaleString(), 105, 280, { align: 'center' });
   
    doc.save(`${title.replace(/\s/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
}
 
function exportPropertyRecordsToPDF() {
    const data = propertyRecords.map(rec => ({
        owner_name: rec.owner_name,
        lot_number: rec.lot_number,
        title_number: rec.title_number || '-',
        location: rec.location || '-',
        transaction_type: rec.transaction_type,
        created_at: rec.created_at,
        status: rec.status
    }));
    generatePDF('Property Records Report', data, ['Owner Name', 'Lot Number', 'Title Number', 'Location', 'Type', 'Date Filed', 'Status']);
    showToast('PDF exported successfully', 'success');
}
 
function exportTransactionsToPDF() {
    const data = transactions.map(rec => ({
        owner_name: rec.owner_name,
        received_date: rec.received_date,
        released_date: rec.released_date || '-',
        status: rec.status,
        action_taken: rec.action_taken || '-'
    }));
    generatePDF('Transactions Report', data, ['Owner Name', 'Received Date', 'Released Date', 'Status', 'Action Taken']);
    showToast('PDF exported successfully', 'success');
}
 
function exportTaxMappingToPDF() {
    const data = taxMappings.map(rec => ({
        owner_name: rec.owner_name,
        lot_number: rec.lot_number,
        received_date: rec.received_date,
        released_date: rec.released_date || '-',
        status: rec.status
    }));
    generatePDF('Tax Mapping & Appraisal Report', data, ['Owner Name', 'Lot Number', 'Received Date', 'Released Date', 'Status']);
    showToast('PDF exported successfully', 'success');
}
 
// Quick Actions
function quickNewProperty() {
    navigateTo('property-records');
    setTimeout(showPropertyModal, 300);
}
 
function quickNewTaxMapping() {
    navigateTo('taxmapping');
    setTimeout(showTaxModal, 300);
}
 
function quickGenerateReport() {
    navigateTo('reports');
}
 
function handleGlobalSearch() {
    const term = document.getElementById('global-search').value.toLowerCase().trim();
    if (!term) return;
   
    if (propertyRecords.some(r => r.owner_name.toLowerCase().includes(term) || r.lot_number.toLowerCase().includes(term))) {
        navigateTo('property-records');
        return;
    }
   
    if (taxMappings.some(t => t.owner_name.toLowerCase().includes(term) || t.lot_number.toLowerCase().includes(term))) {
        navigateTo('taxmapping');
        return;
    }
   
    showToast('No matching records found', 'error');
}
 
// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search').focus();
    }
});
 
// Initialize
window.onload = () => {
    loadFromLocalStorage();
    if (propertyRecords.length === 0) getSampleData();
    saveToLocalStorage();
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    // Initialize dashboard
    updateDashboardStats();
    renderRecentActivity();
    console.log('%c🚀 Municipal Assessor Management System ready!', 'color:#1e3a8a; font-weight:700');
};
