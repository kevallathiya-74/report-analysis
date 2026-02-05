let visitCount = 0;

// Initialize with one visit form
document.addEventListener('DOMContentLoaded', function() {
    addVisitForm();
    
    document.getElementById('addVisitBtn').addEventListener('click', addVisitForm);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeReports);
});

function addVisitForm() {
    visitCount++;
    const container = document.getElementById('visitsContainer');
    
    const visitForm = document.createElement('div');
    visitForm.className = 'visit-form';
    visitForm.id = `visit-${visitCount}`;
    
    visitForm.innerHTML = `
        <div class="visit-header">
            <div class="visit-title">Visit ${visitCount}</div>
            ${visitCount > 1 ? `<button type="button" class="remove-visit-btn" onclick="removeVisit(${visitCount})">✕ Remove</button>` : ''}
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="date-${visitCount}">Visit Date *</label>
                <input type="date" id="date-${visitCount}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="glucose-${visitCount}">Glucose (mg/dL)</label>
                <input type="number" id="glucose-${visitCount}" step="0.1" placeholder="e.g., 110">
            </div>
            <div class="form-group">
                <label for="cholesterol-${visitCount}">Cholesterol (mg/dL)</label>
                <input type="number" id="cholesterol-${visitCount}" step="0.1" placeholder="e.g., 200">
            </div>
            <div class="form-group">
                <label for="bp-${visitCount}">Blood Pressure - Systolic (mmHg)</label>
                <input type="number" id="bp-${visitCount}" step="0.1" placeholder="e.g., 120">
            </div>
        </div>
    `;
    
    container.appendChild(visitForm);
}

function removeVisit(id) {
    const visitForm = document.getElementById(`visit-${id}`);
    if (visitForm) {
        visitForm.remove();
    }
}

function collectReports() {
    const reports = [];
    const visitForms = document.querySelectorAll('.visit-form');
    
    visitForms.forEach(form => {
        const id = form.id.split('-')[1];
        const date = document.getElementById(`date-${id}`).value;
        const glucose = document.getElementById(`glucose-${id}`).value;
        const cholesterol = document.getElementById(`cholesterol-${id}`).value;
        const bp = document.getElementById(`bp-${id}`).value;
        
        if (!date) {
            return;
        }
        
        const report = { date };
        
        if (glucose) report.glucose = glucose;
        if (cholesterol) report.cholesterol = cholesterol;
        if (bp) report.blood_pressure = bp;
        
        // Only add report if it has at least one parameter
        if (glucose || cholesterol || bp) {
            reports.push(report);
        }
    });
    
    return reports;
}

async function analyzeReports() {
    // Hide previous results and errors
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
    
    // Get patient information
    const patientName = document.getElementById('patientName').value.trim();
    const patientId = document.getElementById('patientId').value.trim();
    const patientAge = document.getElementById('patientAge').value.trim();
    const patientGender = document.getElementById('patientGender').value;
    const reportType = document.getElementById('reportType').value;
    
    // Validate required fields
    if (!patientName) {
        showError('Please enter patient name.');
        return;
    }
    
    if (!reportType) {
        showError('Please select report type.');
        return;
    }
    
    // Collect data
    const reports = collectReports();
    
    // Validate
    if (reports.length === 0) {
        showError('Please enter at least one visit with clinical data.');
        return;
    }
    
    // Show loading
    document.getElementById('loadingSection').style.display = 'block';
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                reports,
                patient_info: {
                    name: patientName,
                    id: patientId || 'N/A',
                    age: patientAge || 'N/A',
                    gender: patientGender || 'N/A',
                    report_type: reportType
                }
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Analysis failed');
        }
        
        // Hide loading
        document.getElementById('loadingSection').style.display = 'none';
        
        // Display results
        displayResults(data);
        
    } catch (error) {
        document.getElementById('loadingSection').style.display = 'none';
        showError('Error: ' + error.message);
    }
}

function displayResults(data) {
    const { analysis, guidance, abnormal_parameters } = data;
    const patientInfo = analysis.patient_info;
    
    // Display summary with complete patient information
    const summarySection = document.getElementById('summarySection');
    summarySection.innerHTML = `
        <div class="summary-info">
            <h3>📋 ${patientInfo.report_type} Report - ${patientInfo.name}</h3>
            <div class="summary-details">
                <div class="summary-item">
                    <strong>Patient ID</strong>
                    ${patientInfo.id}
                </div>
                <div class="summary-item">
                    <strong>Age</strong>
                    ${patientInfo.age}
                </div>
                <div class="summary-item">
                    <strong>Gender</strong>
                    ${patientInfo.gender}
                </div>
                <div class="summary-item">
                    <strong>Total Visits</strong>
                    ${analysis.total_visits}
                </div>
                <div class="summary-item">
                    <strong>Date Range</strong>
                    ${analysis.date_range.start} to ${analysis.date_range.end}
                </div>
                <div class="summary-item">
                    <strong>Parameters Analyzed</strong>
                    ${Object.keys(analysis.parameters).length}
                </div>
            </div>
        </div>
    `;
    
    // Display parameters
    const parametersSection = document.getElementById('parametersSection');
    parametersSection.innerHTML = '';
    
    for (const [param, info] of Object.entries(analysis.parameters)) {
        const trendClass = `trend-${info.trend.trend}`;
        
        let abnormalitiesHtml = '';
        if (info.abnormalities.length > 0) {
            abnormalitiesHtml = `
                <div class="abnormality-alert">
                    <h4>⚠️ Abnormal in ${info.abnormal_count}/${analysis.total_visits} visits</h4>
                    <ul class="abnormality-list">
                        ${info.abnormalities.map(abn => `
                            <li>
                                <strong>${abn.date}:</strong> ${abn.value} 
                                <span class="status-${abn.status}">(${abn.status})</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        } else {
            abnormalitiesHtml = `
                <div class="normal-range">
                    <strong>✓ Within normal range across all visits</strong>
                </div>
            `;
        }
        
        const paramCard = `
            <div class="parameter-card">
                <div class="parameter-header">
                    <div class="parameter-name">${param}</div>
                    <div class="trend-badge ${trendClass}">${info.trend.trend.toUpperCase()}</div>
                </div>
                <div class="parameter-details">
                    <p><strong>Normal Range:</strong> ${info.normal_range[0]} - ${info.normal_range[1]}</p>
                    <p><strong>Values:</strong> <span class="values-list">${info.trend.values.join(' → ')}</span></p>
                    <p><strong>Change:</strong> ${info.trend.change > 0 ? '+' : ''}${info.trend.change}</p>
                </div>
                ${abnormalitiesHtml}
            </div>
        `;
        
        parametersSection.innerHTML += paramCard;
    }
    
    // Display guidance if there are abnormal parameters
    if (abnormal_parameters.length > 0) {
        const guidanceSection = document.getElementById('guidanceSection');
        const guidanceContent = document.getElementById('guidanceContent');
        
        guidanceContent.innerHTML = '';
        
        for (const [param, tips] of Object.entries(guidance)) {
            const guidanceCard = `
                <div class="guidance-card">
                    <h3>${param}</h3>
                    <div class="guidance-section">
                        <h4>✓ DO:</h4>
                        <ul>
                            ${tips.care.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="guidance-section avoid">
                        <h4>✗ AVOID:</h4>
                        <ul>
                            ${tips.avoid.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            guidanceContent.innerHTML += guidanceCard;
        }
        
        guidanceSection.style.display = 'block';
    }
    
    // Show results
    document.getElementById('resultsSection').style.display = 'block';
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function showError(message) {
    const errorSection = document.getElementById('errorSection');
    errorSection.textContent = message;
    errorSection.style.display = 'block';
    errorSection.scrollIntoView({ behavior: 'smooth' });
}
