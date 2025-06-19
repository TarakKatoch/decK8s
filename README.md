# decK8s - Kubernetes Dashboard & Security Scanner

## About This Project
I built **decK8s** to showcase my ability to design, implement, and deliver a modern, full-stack Kubernetes dashboard from scratch. This project demonstrates my skills in backend API development, frontend engineering, cloud-native tooling, and user-centric design. **decK8s is designed for monitoring and managing a single Kubernetes cluster at a time, making it perfect for local, development, or single-production cluster environments.**

## Why decK8s Matters
- **End-to-End Solution:** Designed, coded, and styled every part of this dashboard myself.
- **DevOps Mindset:** Combines cluster monitoring, security, and usability in one tool.
- **Professional UI/UX:** Clean, modern, and responsive interface with advanced features.
- **Real-World Impact:** Solves real problems for teams running Kubernetes in production or development.

## Features
- **Single-Cluster Focus:** All monitoring and management is for one Kubernetes cluster at a time (local, dev, or production).
- **System & Cluster Metrics:** Real-time stats for both host and Kubernetes nodes/pods.
![Images](/Images/Screenshot%202025-06-19%20225456.png)
![Images](/Images/Screenshot%202025-06-19%20225525.png)

- **Service Discovery:** Visual mapping of services to pods, with interactive details.
- **Pod Health Tracking:** Table with status, restarts, uptime, and filters.
- **Live Event Stream:** Real-time Kubernetes events with advanced filtering and search.
![Images](/Images/Screenshot%202025-06-19%20233200.png)
![Images](/Images/Screenshot%202025-06-19%20233227.png)
![Images](/Images/Screenshot%202025-06-19%20233251.png)

- **Security Scanner:** Trivy-powered image scanning, user-friendly vulnerability table, exportable reports.
![Images](/Images/Screenshot%202025-06-19%20233412.png)
![Images](/Images/Screenshot%202025-06-19%20233509.png)

- **Modern UI:** Glassmorphism tabs, smooth notifications, responsive layout, and particle background.

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3 (custom), JavaScript (vanilla)
- **Backend:** Python 3, Flask
- **Kubernetes API:** Official Python client
- **Security:** Trivy (Aqua Security)
- **Visualization:** Chart.js, Particle.js

## 📁 Project Structure
```
decK8s/
├── README.md              # Project documentation
├── systeminfo.py          # Flask backend server & API
├── dashboardindex.html    # Main dashboard UI
├── styles.css             # Custom CSS styles
├── app.js                 # Frontend JavaScript logic
├── requirements.txt       # Python dependencies
└── docs/                  # (Optional) Additional documentation
```

## File Explanations
- **README.md**: This documentation file.
- **systeminfo.py**: Flask server providing REST API endpoints for system info, Kubernetes data, Trivy scanning, and event streaming.
- **dashboardindex.html**: Main HTML file for the dashboard UI, including all page sections.
- **styles.css**: Custom CSS for layout, glassmorphism tabs, tables, notifications, and responsive design.
- **app.js**: Handles data fetching, tab navigation, rendering, notifications, and all interactivity.
- **requirements.txt**: Lists required Python packages (Flask, kubernetes, psutil, etc).
- **docs/**: (Optional) Folder for extra documentation or screenshots.

## Setup Instructions
### 1. **Install Dependencies**
- **Python 3.8+**
- **pip** (Python package manager)
- **Docker Desktop** (with Kubernetes enabled)
- **kubectl** (Kubernetes CLI)
- **Trivy** (security scanner)

**Install Python dependencies:**
```bash
pip install -r requirements.txt
```

**Install Trivy:**
- Windows: `choco install trivy`
- macOS: `brew install trivy`
- Linux: See [Trivy install docs](https://aquasecurity.github.io/trivy/v0.18.3/installation/)

### 2. **Docker Desktop Settings**
- Enable Kubernetes: Docker Desktop > Settings > Kubernetes > Enable Kubernetes
- Resource Allocation: At least 4GB RAM, 2 CPUs, 20GB disk (Settings > Resources)

### 3. **Start the Dashboard**
```bash
python systeminfo.py
```
- Open your browser to [http://localhost:5000](http://localhost:5000)

## Future Enhancements
- **Multi-cluster support** (monitor multiple clusters)
- **Role-based access control** (user authentication/permissions)
- **Pod log viewer** (real-time logs in dashboard)
- **Historical metrics & trends**
- **Alerting/notifications** (email, Slack, etc)
- **Custom dashboards/layouts**
- **Resource quota & network policy visualization**
- **Export event stream to CSV/JSON**
- **Dark mode toggle**

 
