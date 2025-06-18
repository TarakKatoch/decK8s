# decK8s - Kubernetes Dashboard & Security Scanner

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg" alt="Python Version">
  <img src="https://img.shields.io/badge/Flask-2.0+-green.svg" alt="Flask Version">
  <img src="https://img.shields.io/badge/Kubernetes-1.20+-orange.svg" alt="Kubernetes Version">
  <img src="https://img.shields.io/badge/Trivy-Security Scanner-red.svg" alt="Trivy Scanner">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</div>

## 🎯 Project Significance

**decK8s** is a comprehensive, modern Kubernetes monitoring and security dashboard that provides real-time system metrics, cluster management, container security scanning, and advanced pod health tracking. Built with a focus on user experience and security, it offers a professional-grade solution for DevOps teams, system administrators, and security professionals.

### Why decK8s?
- **🔍 Real-time Monitoring**: Live system metrics with beautiful pie charts
- **🛡️ Security First**: Integrated Trivy vulnerability scanning
- **🔗 Service Discovery**: Visual service-to-pod mapping with click interactions
- **🏥 Health Tracking**: Comprehensive pod health and restart monitoring
- **🎨 Modern UI**: Apple-inspired design with particle animations
- **⚡ Performance**: Lightweight Flask backend with responsive frontend
- **🔧 Easy Setup**: Simple installation and configuration
- **📊 Professional**: Production-ready monitoring solution

## ✨ Features

### 📊 System Metrics Dashboard
- **Real-time CPU Monitoring**: Live CPU usage with color-coded alerts
- **Memory Analytics**: RAM utilization with detailed breakdown
- **Storage Tracking**: Disk usage monitoring with capacity alerts
- **Interactive Pie Charts**: Dynamic color coding (Green/Yellow/Red)
- **Auto-refresh**: Configurable 5-second intervals
- **Responsive Design**: Works on all screen sizes

### ⚙️ Kubernetes Cluster Management
- **Namespace Management**: Easy switching between namespaces
- **Resource Monitoring**: Deployments, Pods, and Services tracking
- **Health Checks**: Automated cluster health assessment
- **Real-time Updates**: Live cluster status monitoring
- **Multi-namespace Support**: Monitor across different namespaces

### 🔗 Service Discovery & Mapping
- **Service-to-Pod Mapping**: Click any service to see backing pods
- **Interactive Service Cards**: Visual service overview with pod counts
- **Modal Details**: Comprehensive service information display
- **Pod Status Indicators**: Real-time pod readiness and health
- **No Pod Alerts**: Clear warnings when services have no backing pods
- **Container Details**: Individual container status and restart counts

### 🏥 Pod Health & Restart Tracking
- **Comprehensive Pod Table**: Detailed view of all pods in namespace
- **Status Filtering**: Filter by Running, Pending, Failed, Unhealthy, CrashLoopBackOff
- **Restart Monitoring**: Visual indicators for pod restart counts
- **Uptime Tracking**: Real-time pod uptime calculation
- **Health Statistics**: Total, Healthy, and Unhealthy pod counts
- **Action Buttons**: Details and Delete actions (extensible)
- **Real-time Refresh**: Manual refresh with loading states

### 🛡️ Security Scanner
- **Trivy Integration**: Comprehensive vulnerability scanning
- **Docker Image Analysis**: Security assessment of container images
- **Real-time Scanning**: Instant security feedback
- **Detailed Reports**: JSON-formatted vulnerability data
- **Multiple Image Support**: Scan any Docker image

### 🎨 Modern User Interface
- **Apple-inspired Design**: Clean, professional aesthetics
- **Particle Background**: Interactive animated background
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: Professional transitions and effects
- **Dark/Light Theme**: Optimized color schemes
- **Interactive Modals**: Professional service and pod detail views

## 📁 Project Structure

```
deck8s/
├── README.md                 # Project documentation
├── systeminfo.py            # Flask backend server
├── dashboardindex.html      # Main dashboard interface
├── styles.css              # Apple-inspired styling
├── app.js                  # Frontend JavaScript logic
├── requirements.txt        # Python dependencies
└── docs/                   # Additional documentation
```

### File Descriptions

#### `systeminfo.py`
**Backend Flask Server**
- **Purpose**: Main application server and API endpoints
- **Features**:
  - System metrics collection using `psutil`
  - Kubernetes API integration
  - Trivy security scanning
  - Service-to-pod mapping API
  - Pod health and restart tracking API
  - RESTful API endpoints
  - CORS support for frontend communication

#### `dashboardindex.html`
**Main Dashboard Interface**
- **Purpose**: Primary user interface
- **Features**:
  - Responsive HTML5 structure
  - Chart.js integration for pie charts
  - Particle.js animated background
  - Apple-inspired design elements
  - Interactive form elements
  - Service cards and modals
  - Pod health table with filters

#### `styles.css`
**Apple-inspired Styling**
- **Purpose**: Modern, professional CSS styling
- **Features**:
  - Apple design system colors
  - Responsive grid layouts
  - Smooth animations and transitions
  - Professional typography
  - Interactive hover effects
  - Modal and table styling
  - Status indicators and badges

#### `app.js`
**Frontend JavaScript Logic**
- **Purpose**: Dashboard functionality and interactivity
- **Features**:
  - Real-time data fetching
  - Chart.js integration
  - Notification system
  - Auto-refresh functionality
  - Service-to-pod mapping
  - Pod health tracking and filtering
  - Error handling and user feedback

## 🚀 Installation

### Prerequisites

1. **Python 3.8+**
   ```bash
   python --version
   ```

2. **Docker Desktop**
   - Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Install and start Docker Desktop

3. **kubectl**
   ```bash
   # Windows (with Chocolatey)
   choco install kubernetes-cli
   
   # macOS (with Homebrew)
   brew install kubectl
   
   # Linux
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```

4. **Trivy Security Scanner**
   ```bash
   # Windows (with Chocolatey)
   choco install trivy
   
   # macOS (with Homebrew)
   brew install trivy
   
   # Linux
   curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
   ```

### Docker Desktop Settings

1. **Enable Kubernetes**
   - Open Docker Desktop
   - Go to Settings → Kubernetes
   - Check "Enable Kubernetes"
   - Click "Apply & Restart"

2. **Resource Allocation** (Recommended)
   - Go to Settings → Resources
   - Allocate at least:
     - **Memory**: 4GB
     - **CPU**: 2 cores
     - **Disk**: 20GB

3. **Verify Kubernetes**
   ```bash
   kubectl get nodes
   # Should show: docker-desktop   Ready
   ```

### Project Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd deck8s
   ```

2. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify Trivy Installation**
   ```bash
   trivy --version
   # Should show Trivy version
   ```

## 🏃‍♂️ Running the Project

### Start the Dashboard

1. **Launch the Flask Server**
   ```bash
   python systeminfo.py
   ```

2. **Access the Dashboard**
   - Open your browser
   - Navigate to: `http://localhost:5000`
   - Dashboard will load automatically

### Dashboard Features

#### System Metrics
- **Real-time Monitoring**: CPU, Memory, and Storage usage
- **Color-coded Alerts**: 
  - 🟢 Green: <60% (Healthy)
  - 🟡 Yellow: 60-79% (Moderate)
  - 🔴 Red: 80%+ (Critical)

#### Kubernetes Management
- **Namespace Selection**: Dropdown to switch namespaces
- **Resource Counts**: Live deployment, pod, and service counts
- **Health Checks**: Click "Run Health Check" for cluster status

#### Service Discovery
- **Service Cards**: Click any service to view details
- **Pod Mapping**: See all pods backing each service
- **Modal Details**: Comprehensive service information
- **No Pod Alerts**: Clear warnings for services without backing pods

#### Pod Health Tracking
- **Status Filters**: Filter by Running, Pending, Failed, etc.
- **Restart Monitoring**: Visual indicators for restart counts
- **Uptime Display**: Real-time pod uptime calculation
- **Health Statistics**: Overview of healthy vs unhealthy pods
- **Manual Refresh**: Click refresh button for latest data

#### Security Scanning
- **Image Scanning**: Enter Docker image name (e.g., `nginx:latest`)
- **Vulnerability Reports**: Detailed JSON security analysis
- **Real-time Results**: Instant scanning feedback

### Testing the Dashboard

1. **Create Test Resources**
   ```bash
   # Create a test deployment
   kubectl create deployment nginx-test --image=nginx:latest
   
   # Create a service
   kubectl expose deployment nginx-test --port=80
   
   # Check resources
   kubectl get all
   ```

2. **Test Service Discovery**
   - Go to Services section
   - Click on any service card
   - View backing pods in modal

3. **Test Pod Health Tracking**
   - Go to Pod Health section
   - Use filters to view different pod states
   - Click refresh button to update data

4. **Test Security Scanning**
   - Enter `nginx:latest` in the scanner
   - Click "Scan Image"
   - View vulnerability results

5. **Test Auto-refresh**
   - Enable auto-refresh toggle
   - Watch metrics update every 5 seconds

## 🔧 Configuration

### Environment Variables
```bash
# Logging level (optional)
export LOG_LEVEL=INFO

# Flask debug mode (optional)
export FLASK_DEBUG=False
```

### Customization

#### Chart Colors
Edit `app.js` to modify color thresholds:
```javascript
if (percentage >= 80) {
    usedColor = '#EF4444'; // Red
} else if (percentage >= 60) {
    usedColor = '#F59E0B'; // Yellow
} else {
    usedColor = '#10B981'; // Green
}
```

#### Auto-refresh Interval
Modify the interval in `app.js`:
```javascript
autoRefreshInterval = setInterval(updateDashboard, 5000); // 5 seconds
```

#### Pod Health Filters
Add custom filters in `systeminfo.py`:
```python
elif status_filter.lower() == 'custom':
    # Add your custom filter logic
    pass
```

## 🛠️ Troubleshooting

### Common Issues

1. **Kubernetes Not Running**
   ```bash
   # Check Docker Desktop Kubernetes status
   kubectl get nodes
   
   # Restart Docker Desktop if needed
   ```

2. **Trivy Not Found**
   ```bash
   # Verify Trivy installation
   trivy --version
   
   # Reinstall if needed
   choco install trivy  # Windows
   brew install trivy   # macOS
   ```

3. **Port Already in Use**
   ```bash
   # Check if port 5000 is in use
   netstat -ano | findstr :5000
   
   # Kill process or change port in systeminfo.py
   ```

4. **Chart.js Not Loading**
   - Check internet connection
   - Verify CDN links in HTML
   - Clear browser cache

5. **Services/Pods Not Loading**
   - Check browser console for JavaScript errors
   - Verify namespace selection
   - Check Kubernetes API connectivity

### Performance Optimization

1. **Reduce Auto-refresh Frequency**
   - Change from 5 seconds to 10-30 seconds
   - Reduces server load

2. **Limit Particle Count**
   - Edit particle count in HTML
   - Reduce from 80 to 40-60 particles

3. **Optimize Chart Updates**
   - Charts update only when data changes
   - Efficient rendering with Chart.js

## 📈 Future Enhancements

### Planned Features
- **Multi-cluster Support**: Monitor multiple Kubernetes clusters
- **Alert System**: Email/Slack notifications for critical metrics
- **Historical Data**: Data retention and trend analysis
- **Custom Dashboards**: User-configurable layouts
- **Role-based Access**: User authentication and permissions
- **API Documentation**: Swagger/OpenAPI integration
- **Pod Logs Viewer**: Real-time log streaming
- **Resource Quotas**: Namespace resource monitoring
- **Network Policies**: Network security visualization
- **RBAC Management**: Role and permission management

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flask**: Web framework
- **Chart.js**: Interactive charts
- **Particle.js**: Background animations
- **Trivy**: Security scanning
- **Kubernetes**: Container orchestration
- **Apple Design System**: UI inspiration

---

<div align="center">
  <strong>decK8s</strong> - Modern Kubernetes Monitoring & Security Dashboard
  
  Built with ❤️ for the DevOps community
</div> 