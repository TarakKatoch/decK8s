document.addEventListener('DOMContentLoaded', () => {
    const scanForm = document.getElementById('scanForm');
    const imageInput = document.getElementById('imageInput');
    const scanResults = document.getElementById('scanResults');
    const healthCheckButton = document.getElementById('healthCheckButton');
    const healthCheckResult = document.getElementById('healthCheckResult');
    const namespaceDropdown = document.getElementById('namespace-dropdown');
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    
    let defaultNamespace = 'default';
    let autoRefreshInterval;
    let isInitialized = false;

    // Chart instances
    let storageChart, memoryChart, cpuChart;

    // ========== Initial Setup ==========
    init();

    function init() {
        if (scanForm) scanForm.addEventListener('submit', handleImageScan);
        if (healthCheckButton) healthCheckButton.addEventListener('click', handleHealthCheck);
        if (namespaceDropdown) namespaceDropdown.addEventListener('change', handleNamespaceChange);
        if (autoRefreshToggle) autoRefreshToggle.addEventListener('change', toggleAutoRefresh);

        // Initialize pie charts
        initializeCharts();

        // Initialize modal functionality
        initializeModal();

        // Initialize pod health functionality
        initializePodHealth();

        // Initial dashboard load
        updateDashboard();
        fetchNamespaces(); // Load namespaces immediately
        isInitialized = true;
    }

    // ========== Chart Initialization ==========
    function initializeCharts() {
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            elements: {
                arc: {
                    borderWidth: 0
                }
            }
        };

        // Storage Chart
        const storageCtx = document.getElementById('storageChart').getContext('2d');
        storageChart = new Chart(storageCtx, {
            type: 'doughnut',
            data: {
                labels: ['Used', 'Free'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#0071E3', '#E5E7EB'],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });

        // Memory Chart
        const memoryCtx = document.getElementById('memoryChart').getContext('2d');
        memoryChart = new Chart(memoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Used', 'Free'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#0071E3', '#E5E7EB'],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });

        // CPU Chart
        const cpuCtx = document.getElementById('cpuChart').getContext('2d');
        cpuChart = new Chart(cpuCtx, {
            type: 'doughnut',
            data: {
                labels: ['Used', 'Free'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#0071E3', '#E5E7EB'],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });
    }

    // ========== Modal Initialization ==========
    function initializeModal() {
        const modal = document.getElementById('serviceModal');
        const closeBtn = modal.querySelector('.close');
        
        // Close modal when clicking the X button
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }

    // ========== Pod Health Initialization ==========
    function initializePodHealth() {
        const statusFilter = document.getElementById('statusFilter');
        const refreshPodsBtn = document.getElementById('refreshPods');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', handlePodFilterChange);
        }
        
        if (refreshPodsBtn) {
            refreshPodsBtn.addEventListener('click', handlePodRefresh);
        }
    }

    // ========== Handlers ==========

    function handleImageScan(event) {
        event.preventDefault();
        const imageName = imageInput.value.trim();
        
        if (!imageName) {
            showNotification('Please enter a Docker image name.', 'warning');
            return;
        }

        // Show loading state
        const submitButton = scanForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = '🔍 Scanning...';
        submitButton.disabled = true;
        scanResults.textContent = 'Initializing scan...';

        scanImage(imageName).finally(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    }

    function handleHealthCheck() {
        healthCheckButton.textContent = '🔍 Checking...';
        healthCheckButton.disabled = true;
        healthCheckResult.textContent = '';
        
        fetchKubernetesInfo(defaultNamespace, (data) => {
            const healthy = data.num_pods > 0;
            healthCheckResult.textContent = healthy ? '✅ Healthy' : '❌ Unhealthy';
            healthCheckResult.style.color = healthy ? '#10b981' : '#ef4444';
            healthCheckButton.textContent = '🔍 Run Health Check';
            healthCheckButton.disabled = false;
        }, () => {
            healthCheckResult.textContent = '❌ Error';
            healthCheckResult.style.color = '#ef4444';
            healthCheckButton.textContent = '🔍 Run Health Check';
            healthCheckButton.disabled = false;
        });
    }

    function handleNamespaceChange() {
        const selectedNamespace = namespaceDropdown.value;
        defaultNamespace = selectedNamespace;
        
        // Reset health check status when changing namespaces
        if (healthCheckResult) {
            healthCheckResult.textContent = '';
        }
        
        fetchKubernetesInfo(selectedNamespace);
        fetchServicePodMapping(selectedNamespace); // Refresh services
        fetchPodHealth(selectedNamespace); // Refresh pod health
    }

    function toggleAutoRefresh() {
        // Clear any existing notifications first
        clearAllNotifications();
        
        if (autoRefreshToggle.checked) {
            autoRefreshInterval = setInterval(updateDashboard, 5000);
            showNotification('Auto-refresh enabled (5s interval)', 'info');
        } else {
            clearInterval(autoRefreshInterval);
            showNotification('Auto-refresh disabled', 'info');
        }
    }

    function handlePodFilterChange() {
        const statusFilter = document.getElementById('statusFilter');
        const selectedFilter = statusFilter.value;
        console.log('🔍 Pod filter changed to:', selectedFilter);
        fetchPodHealth(defaultNamespace, selectedFilter);
    }

    function handlePodRefresh() {
        const refreshBtn = document.getElementById('refreshPods');
        const statusFilter = document.getElementById('statusFilter');
        const originalText = refreshBtn.textContent;
        const currentFilter = statusFilter ? statusFilter.value : 'all';
        
        refreshBtn.textContent = '⏳ Refreshing...';
        refreshBtn.disabled = true;
        
        fetchPodHealth(defaultNamespace, currentFilter).finally(() => {
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
        });
    }

    // ========== Dashboard Functions ==========

    function updateDashboard() {
        console.log('🔄 Updating dashboard...');
        fetchSystemInfo();
        if (isInitialized) {
            console.log('📡 Fetching namespaces and services...');
            fetchNamespaces();
            // fetchServicePodMapping and fetchPodHealth are now called from fetchNamespaces after namespace is set
        }
    }

    function fetchSystemInfo() {
        fetch('http://127.0.0.1:5000/system_info')
            .then(res => res.json())
            .then(data => {
                updateChart(storageChart, data.disk_usage.percent, 'storagePercentage', {
                    used: data.disk_usage.used,
                    free: data.disk_usage.free,
                    usedId: 'storageUsed',
                    freeId: 'storageFree'
                });
                updateChart(memoryChart, data.memory_usage.percent, 'memoryPercentage', {
                    used: data.memory_usage.used,
                    free: data.memory_usage.available,
                    usedId: 'memoryUsed',
                    freeId: 'memoryFree'
                });
                updateChart(cpuChart, data.cpu_percent, 'cpuPercentage', {
                    used: data.cpu_percent,
                    free: 100 - data.cpu_percent,
                    usedId: 'cpuUsed',
                    freeId: 'cpuFree'
                });
            })
            .catch(err => {
                console.error('❌ System info fetch failed:', err);
                showNotification('Failed to fetch system metrics', 'error');
            });
    }

    function updateChart(chart, percentage, percentageElementId, usageData) {
        if (chart) {
            // Determine color based on usage percentage
            let usedColor;
            if (percentage >= 80) {
                usedColor = '#EF4444'; // Red for high usage (80%+)
            } else if (percentage >= 60) {
                usedColor = '#F59E0B'; // Yellow for moderate usage (60-79%)
            } else {
                usedColor = '#10B981'; // Green for low usage (<60%)
            }
            
            chart.data.datasets[0].data = [percentage, 100 - percentage];
            chart.data.datasets[0].backgroundColor = [usedColor, '#E5E7EB'];
            chart.update('active');
        }
        
        // Update percentage display
        const percentageElement = document.getElementById(percentageElementId);
        if (percentageElement) {
            percentageElement.textContent = `${Math.round(percentage)}%`;
        }
        
        // Update usage details
        if (usageData) {
            const usedElement = document.getElementById(usageData.usedId);
            const freeElement = document.getElementById(usageData.freeId);
            
            if (usedElement) {
                usedElement.textContent = formatBytes(usageData.used);
            }
            if (freeElement) {
                freeElement.textContent = formatBytes(usageData.free);
            }
        }
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function fetchNamespaces() {
        fetch('http://127.0.0.1:5000/kubernetes_namespaces')
            .then(res => res.json())
            .then(namespaces => {
                // Clear existing options
                namespaceDropdown.innerHTML = '';
                
                // Add namespace options
                namespaces.forEach(namespace => {
                    const option = document.createElement('option');
                    option.value = namespace;
                    option.textContent = namespace;
                    namespaceDropdown.appendChild(option);
                });

                // Set default or retain selected
                if (!namespaces.includes(defaultNamespace)) {
                    defaultNamespace = namespaces[0] || 'default';
                }
                namespaceDropdown.value = defaultNamespace;

                fetchKubernetesInfo(defaultNamespace);
                fetchServicePodMapping(defaultNamespace); // Fetch services after namespace is set
                fetchPodHealth(defaultNamespace); // Fetch pod health after namespace is set
            })
            .catch(err => {
                console.error('❌ Failed to fetch namespaces:', err);
                showNotification('Failed to fetch Kubernetes namespaces', 'error');
            });
    }

    function fetchKubernetesInfo(namespace, onSuccess, onError) {
        fetch(`http://127.0.0.1:5000/kubernetes_info?namespace=${namespace}`)
            .then(res => res.json())
            .then(data => {
                updateMetric('.deployments .count', data.num_deployments);
                updateMetric('.pods-running .count', data.num_pods);
                updateMetric('.services-running .count', data.num_services);
                if (onSuccess) onSuccess(data);
            })
            .catch(err => {
                console.error(`❌ Failed to fetch Kubernetes info for ${namespace}:`, err);
                if (onError) onError(err);
            });
    }

    function scanImage(imageName) {
        return fetch('http://127.0.0.1:5000/scan_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ container_id: imageName }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    scanResults.textContent = `Error: ${data.error}`;
                    scanResults.style.color = '#ef4444';
                    showNotification('Scan failed: ' + data.error, 'error');
                } else {
                    scanResults.style.color = '#10b981';
                    scanResults.textContent = '';
                    renderScanResult(data.scan_results);
                    showNotification('Scan completed successfully', 'success');
                }
            })
            .catch(err => {
                console.error('❌ Scan failed:', err);
                scanResults.textContent = 'Scan failed. Please check if Trivy is installed.';
                scanResults.style.color = '#ef4444';
                showNotification('Scan failed. Check Trivy installation.', 'error');
            });
    }

    function renderScanResult(result) {
        try {
            const formatted = typeof result === 'string' ? JSON.parse(result) : result;
            scanResults.textContent = JSON.stringify(formatted, null, 2);
        } catch (err) {
            scanResults.textContent = result;
        }
    }

    // ========== Service-to-Pod Mapping Functions ==========

    function fetchServicePodMapping(namespace) {
        const servicesList = document.getElementById('servicesList');
        if (!servicesList) {
            console.error('❌ Services list element not found');
            return;
        }

        console.log('🔍 Fetching services for namespace:', namespace);
        servicesList.innerHTML = '<div class="loading">Loading services...</div>';

        fetch(`http://127.0.0.1:5000/service_pod_mapping?namespace=${namespace}`)
            .then(res => {
                console.log('📡 Response status:', res.status);
                return res.json();
            })
            .then(data => {
                console.log('📊 Received data:', data);
                if (data.error) {
                    console.error('❌ Backend error:', data.error);
                    servicesList.innerHTML = `<div class="error">Error: ${data.error}</div>`;
                    showNotification('Failed to fetch services', 'error');
                } else {
                    console.log('✅ Rendering services:', data.services);
                    renderServices(data.services);
                }
            })
            .catch(err => {
                console.error('❌ Failed to fetch service-pod mapping:', err);
                servicesList.innerHTML = '<div class="error">Failed to load services</div>';
                showNotification('Failed to fetch services', 'error');
            });
    }

    function renderServices(services) {
        console.log('🎨 Starting to render services:', services);
        const servicesList = document.getElementById('servicesList');
        
        if (!services || services.length === 0) {
            console.log('📭 No services found, showing empty state');
            servicesList.innerHTML = '<div class="no-services">No services found in this namespace</div>';
            return;
        }

        console.log(`📋 Rendering ${services.length} services`);
        servicesList.innerHTML = ''; // Clear previous

        services.forEach((service, index) => {
            console.log(`🔧 Rendering service ${index + 1}:`, service.name);
            const podCount = service.pods.length;
            const readyPods = service.pods.filter(pod => pod.ready).length;

            const card = document.createElement('div');
            card.className = 'service-card';

            card.innerHTML = `
                <div class="service-name">${service.name}</div>
                <div class="service-type">${service.type}</div>
                <div class="service-ip">${service.cluster_ip || 'None'}</div>
                <div class="service-pods">
                    <span>📦 ${readyPods}/${podCount} pods ready</span>
                    <span class="pod-count">${podCount}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                console.log('🖱️ Service clicked:', service.name);
                showServiceDetails(service.name, service);
            });
            servicesList.appendChild(card);
        });
        
        console.log('✅ Services rendering completed');
    }

    function showServiceDetails(serviceName, serviceData) {
        const modal = document.getElementById('serviceModal');
        const modalServiceName = document.getElementById('modalServiceName');
        const modalServiceType = document.getElementById('modalServiceType');
        const modalServiceIP = document.getElementById('modalServiceIP');
        const modalServicePorts = document.getElementById('modalServicePorts');
        const modalPodsList = document.getElementById('modalPodsList');

        // Update modal header
        modalServiceName.textContent = serviceName;

        // Update service info
        modalServiceType.textContent = serviceData.type;
        modalServiceIP.textContent = serviceData.cluster_ip || 'None';

        // Format ports
        if (serviceData.ports && serviceData.ports.length > 0) {
            const portsText = serviceData.ports.map(port => 
                `${port.port}${port.target_port ? ':' + port.target_port : ''} (${port.protocol})`
            ).join(', ');
            modalServicePorts.textContent = portsText;
        } else {
            modalServicePorts.textContent = 'No ports defined';
        }

        // Render pods
        if (serviceData.pods && serviceData.pods.length > 0) {
            const podsHTML = serviceData.pods.map(pod => {
                const statusClass = getPodStatusClass(pod.status);
                const readyIcon = pod.ready ? '✅' : '❌';
                
                return `
                    <div class="pod-item">
                        <div class="pod-header">
                            <span class="pod-name">${pod.name}</span>
                            <span class="pod-status ${statusClass}">${pod.status}</span>
                        </div>
                        <div class="pod-details">
                            <div class="pod-detail">
                                <span class="label">Ready:</span>
                                <span>${readyIcon} ${pod.ready ? 'Yes' : 'No'}</span>
                            </div>
                            <div class="pod-detail">
                                <span class="label">IP:</span>
                                <span>${pod.ip || 'None'}</span>
                            </div>
                            <div class="pod-detail">
                                <span class="label">Restarts:</span>
                                <span>${pod.restarts}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            modalPodsList.innerHTML = podsHTML;
        } else {
            modalPodsList.innerHTML = `
                <div class="no-pods">
                    No backing pods found for this service!
                    <br><small>This service has no selector or no pods match the selector.</small>
                </div>
            `;
        }

        // Show modal
        modal.style.display = 'block';
    }

    function getPodStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'running':
                return 'running';
            case 'pending':
                return 'pending';
            case 'failed':
            case 'error':
                return 'failed';
            default:
                return 'unknown';
        }
    }

    // Make showServiceDetails globally accessible
    window.showServiceDetails = showServiceDetails;

    // ========== Pod Health Functions ==========

    function fetchPodHealth(namespace, statusFilter = 'all') {
        const podTableBody = document.getElementById('podTableBody');
        if (!podTableBody) {
            console.error('❌ Pod table body element not found');
            return Promise.reject(new Error('Pod table body element not found'));
        }

        console.log('🏥 Fetching pod health for namespace:', namespace, 'filter:', statusFilter);
        podTableBody.innerHTML = '<tr><td colspan="7" class="loading-row">Loading pods...</td></tr>';

        const url = `http://127.0.0.1:5000/pod_health?namespace=${namespace}&status=${statusFilter}`;
        
        return fetch(url)
            .then(res => {
                console.log('📡 Pod health response status:', res.status);
                return res.json();
            })
            .then(data => {
                console.log('📊 Received pod health data:', data);
                if (data.error) {
                    console.error('❌ Backend error:', data.error);
                    podTableBody.innerHTML = `<tr><td colspan="7" class="error">Error: ${data.error}</td></tr>`;
                    showNotification('Failed to fetch pod health', 'error');
                    throw new Error(data.error);
                } else {
                    console.log('✅ Rendering pod health table:', data.pods);
                    renderPodTable(data.pods);
                    updatePodStats(data.pods);
                    return data;
                }
            })
            .catch(err => {
                console.error('❌ Failed to fetch pod health:', err);
                podTableBody.innerHTML = '<tr><td colspan="7" class="error">Failed to load pods</td></tr>';
                showNotification('Failed to fetch pod health', 'error');
                throw err;
            });
    }

    function renderPodTable(pods) {
        const podTableBody = document.getElementById('podTableBody');
        
        if (!pods || pods.length === 0) {
            podTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-pods-message">
                        No pods found matching the current filter
                    </td>
                </tr>
            `;
            return;
        }

        const tableRows = pods.map(pod => {
            const statusClass = getPodStatusClass(pod.status);
            const restartClass = getRestartClass(pod.restarts);
            const readyClass = pod.ready ? 'ready' : 'not-ready';
            const readyIcon = pod.ready ? '✅' : '❌';
            
            return `
                <tr>
                    <td>
                        <div class="pod-name">${pod.name}</div>
                    </td>
                    <td>
                        <span class="pod-status ${statusClass}">
                            ${getStatusIcon(pod.status)} ${pod.status}
                        </span>
                    </td>
                    <td>
                        <span class="restart-count ${restartClass}">
                            🔄 ${pod.restarts}
                        </span>
                    </td>
                    <td>
                        <span class="uptime">${pod.uptime || 'N/A'}</span>
                    </td>
                    <td>
                        <span class="pod-ip">${pod.ip || 'None'}</span>
                    </td>
                    <td>
                        <span class="ready-status ${readyClass}">
                            ${readyIcon} ${pod.ready ? 'Ready' : 'Not Ready'}
                        </span>
                    </td>
                    <td>
                        <div class="pod-actions">
                            <button class="action-btn" onclick="showPodDetails('${pod.name}')">
                                📋 Details
                            </button>
                            <button class="action-btn danger" onclick="deletePod('${pod.name}')">
                                🗑️ Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        podTableBody.innerHTML = tableRows;
    }

    function updatePodStats(pods) {
        const totalPods = pods.length;
        const healthyPods = pods.filter(pod => 
            pod.status.toLowerCase() === 'running' && pod.ready && pod.restarts === 0
        ).length;
        const unhealthyPods = totalPods - healthyPods;

        updateMetric('#totalPods', totalPods);
        updateMetric('#healthyPods', healthyPods);
        updateMetric('#unhealthyPods', unhealthyPods);
    }

    function getPodStatusClass(status) {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'running':
                return 'running';
            case 'pending':
                return 'pending';
            case 'failed':
                return 'failed';
            case 'succeeded':
                return 'succeeded';
            case 'unknown':
                return 'unknown';
            default:
                return 'unknown';
        }
    }

    function getRestartClass(restarts) {
        if (restarts === 0) {
            return 'normal';
        } else if (restarts <= 3) {
            return 'warning';
        } else {
            return 'critical';
        }
    }

    function getStatusIcon(status) {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'running':
                return '🟢';
            case 'pending':
                return '🟡';
            case 'failed':
                return '🔴';
            case 'succeeded':
                return '✅';
            case 'unknown':
                return '❓';
            default:
                return '❓';
        }
    }

    function showPodDetails(podName) {
        console.log('📋 Showing details for pod:', podName);
        showNotification(`Pod details for ${podName} - Feature coming soon!`, 'info');
        // TODO: Implement pod details modal
    }

    function deletePod(podName) {
        if (confirm(`Are you sure you want to delete pod "${podName}"?`)) {
            console.log('🗑️ Deleting pod:', podName);
            showNotification(`Deleting pod ${podName} - Feature coming soon!`, 'warning');
            // TODO: Implement pod deletion
        }
    }

    // Make pod functions globally accessible
    window.showPodDetails = showPodDetails;
    window.deletePod = deletePod;

    // ========== Utility Functions ==========

    // Track active notifications to prevent duplicates
    let activeNotifications = new Set();
    let notificationDebounceTimer = null;

    function updateMetric(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
            // Add a subtle animation
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }

    function clearAllNotifications() {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        activeNotifications.clear();
    }

    function showNotification(message, type = 'info') {
        // Create a unique key for this notification
        const notificationKey = `${message}-${type}`;
        
        // Check if this exact notification is already active
        if (activeNotifications.has(notificationKey)) {
            return; // Don't show duplicate notifications
        }

        // Clear any existing debounce timer
        if (notificationDebounceTimer) {
            clearTimeout(notificationDebounceTimer);
        }

        // Debounce rapid notifications
        notificationDebounceTimer = setTimeout(() => {
            // Remove any existing notifications first
            const existingNotifications = document.querySelectorAll('.notification');
            let hasExistingNotifications = existingNotifications.length > 0;
            
            if (hasExistingNotifications) {
                existingNotifications.forEach(notification => {
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                            activeNotifications.delete(notification.dataset.key);
                        }
                    }, 300);
                });
            }

            // Wait a bit for the previous notification to slide out, then show the new one
            setTimeout(() => {
                // Create notification element
                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                notification.textContent = message;
                notification.dataset.key = notificationKey;
                
                // Style the notification
                Object.assign(notification.style, {
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '500',
                    zIndex: '1000',
                    transform: 'translateX(100%)',
                    transition: 'transform 0.3s ease',
                    maxWidth: '300px',
                    wordWrap: 'break-word',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                });

                // Set background color based on type
                const colors = {
                    success: '#10b981',
                    error: '#ef4444',
                    warning: '#f59e0b',
                    info: '#06b6d4'
                };
                notification.style.backgroundColor = colors[type] || colors.info;

                // Add to page
                document.body.appendChild(notification);
                activeNotifications.add(notificationKey);

                // Animate in with a slight delay for smoother appearance
                requestAnimationFrame(() => {
                    notification.style.transform = 'translateX(0)';
                });

                // Remove after 4 seconds
                setTimeout(() => {
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                            activeNotifications.delete(notificationKey);
                        }
                    }, 300);
                }, 4000);
            }, hasExistingNotifications ? 350 : 50); // Shorter delay if no existing notifications
        }, 100); // 100ms debounce delay
    }

    // ========== Error Handling ==========
    
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showNotification('An unexpected error occurred', 'error');
    });

    // ========== Performance Monitoring ==========
    
    // Log dashboard load time
    const loadTime = performance.now();
    console.log(`🚀 Dashboard loaded in ${loadTime.toFixed(2)}ms`);
});
  