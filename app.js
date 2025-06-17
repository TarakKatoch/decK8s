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

    // ========== Dashboard Functions ==========

    function updateDashboard() {
        fetchSystemInfo();
        if (isInitialized) {
            fetchNamespaces();
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
                namespaceDropdown.innerHTML = '';
                namespaces.forEach(ns => {
                    const option = document.createElement('option');
                    option.value = ns;
                    option.textContent = ns;
                    namespaceDropdown.appendChild(option);
                });

                // Set default or retain selected
                if (!namespaces.includes(defaultNamespace)) {
                    defaultNamespace = namespaces[0] || 'default';
                }
                namespaceDropdown.value = defaultNamespace;

                fetchKubernetesInfo(defaultNamespace);
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
  