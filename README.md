# decK8s - Kubernetes Dashboard & Security Scanner

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg" alt="Python Version">
  <img src="https://img.shields.io/badge/Flask-2.0+-green.svg" alt="Flask Version">
  <img src="https://img.shields.io/badge/Kubernetes-1.20+-orange.svg" alt="Kubernetes Version">
  <img src="https://img.shields.io/badge/Trivy-Security Scanner-red.svg" alt="Trivy Scanner">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</div>

## 🎯 Project Significance

**decK8s** is a comprehensive, modern Kubernetes monitoring and security dashboard that provides real-time system metrics, cluster management, and container security scanning. Built with a focus on user experience and security, it offers a professional-grade solution for DevOps teams, system administrators, and security professionals.

### Why decK8s?
- **🔍 Real-time Monitoring**: Live system metrics with beautiful pie charts
- **🛡️ Security First**: Integrated Trivy vulnerability scanning
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

### ⚙️ Kubernetes Cluster Management
- **Namespace Management**: Easy switching between namespaces
- **Resource Monitoring**: Deployments, Pods, and Services tracking
- **Health Checks**: Automated cluster health assessment
- **Real-time Updates**: Live cluster status monitoring
- **Multi-namespace Support**: Monitor across different namespaces

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

#### `styles.css`
**Apple-inspired Styling**
- **Purpose**: Modern, professional CSS styling
- **Features**:
  - Apple design system colors
  - Responsive grid layouts
  - Smooth animations and transitions
  - Professional typography
  - Interactive hover effects

#### `app.js`
**Frontend JavaScript Logic**
- **Purpose**: Dashboard functionality and interactivity
- **Features**:
  - Real-time data fetching
  - Chart.js integration
  - Notification system
  - Auto-refresh functionality
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

2. **Test Security Scanning**
   - Enter `nginx:latest` in the scanner
   - Click "Scan Image"
   - View vulnerability results

3. **Test Auto-refresh**
   - Enable auto-refresh toggle
   - Watch metrics update every 5 seconds


## 📈 Future Enhancements

### Planned Features
- **Multi-cluster Support**: Monitor multiple Kubernetes clusters
- **Alert System**: Email/Slack notifications for critical metrics
- **Historical Data**: Data retention and trend analysis
- **Custom Dashboards**: User-configurable layouts
- **Role-based Access**: User authentication and permissions
- **API Documentation**: Swagger/OpenAPI integration


---

<div align="center">
  <strong>decK8s</strong> - Modern Kubernetes Monitoring & Security Dashboard
  
  Built with ❤️ for the DevOps community
</div> 