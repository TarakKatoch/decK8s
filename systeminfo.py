import os
import psutil
import logging
import subprocess
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from kubernetes import client, config
from kubernetes.client.rest import ApiException

# Configuration from environment variables
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load Kubernetes configuration
try:
    config.load_kube_config()
    logging.info("✅ Kubernetes configuration loaded successfully.")
except Exception as e:
    logging.error(f"❌ Failed to load Kubernetes configuration: {str(e)}")

# Serve the main dashboard
@app.route('/')
def dashboard():
    return send_from_directory('.', 'dashboardindex.html')

# Serve static files (CSS, JS, images)
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# Health Check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

# System Information
@app.route('/system_info', methods=['GET'])
def get_system_info():
    try:
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        return jsonify({
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_usage': {
                'total': mem.total,
                'available': mem.available,
                'used': mem.used,
                'percent': mem.percent
            },
            'disk_usage': {
                'total': disk.total,
                'used': disk.used,
                'free': disk.free,
                'percent': disk.percent
            },
            'boot_time': psutil.boot_time()
        })
    except Exception as e:
        logging.error(f"❌ Error fetching system info: {str(e)}")
        return jsonify({'error': 'Failed to fetch system information'}), 500

# Kubernetes Cluster Summary
@app.route('/kubernetes_info', methods=['GET'])
def get_kubernetes_info():
    namespace = request.args.get('namespace', 'default')
    try:
        core_v1 = client.CoreV1Api()
        apps_v1 = client.AppsV1Api()

        deployments = apps_v1.list_namespaced_deployment(namespace)
        services = core_v1.list_namespaced_service(namespace)
        pods = core_v1.list_namespaced_pod(namespace)

        return jsonify({
            'namespace': namespace,
            'num_deployments': len(deployments.items),
            'num_services': len(services.items),
            'num_pods': len(pods.items)
        })
    except ApiException as e:
        logging.error(f"❌ Kubernetes API error: {e.reason}")
        return jsonify({'error': f"Kubernetes API error: {e.reason}"}), 500
    except Exception as e:
        logging.error(f"❌ Error fetching Kubernetes info: {str(e)}")
        return jsonify({'error': 'Failed to fetch Kubernetes information'}), 500

# Namespaces List
@app.route('/kubernetes_namespaces', methods=['GET'])
def get_kubernetes_namespaces():
    try:
        core_v1 = client.CoreV1Api()
        namespaces = [ns.metadata.name for ns in core_v1.list_namespace().items]
        return jsonify(namespaces)
    except Exception as e:
        logging.error(f"❌ Error fetching namespaces: {str(e)}")
        return jsonify({'error': 'Failed to fetch Kubernetes namespaces'}), 500

# Node Info
@app.route('/kubernetes_nodes', methods=['GET'])
def get_kubernetes_nodes():
    try:
        core_v1 = client.CoreV1Api()
        nodes = core_v1.list_node().items
        node_info = [
            {
                'name': node.metadata.name,
                'status': node.status.conditions[-1].type,
                'addresses': [addr.address for addr in node.status.addresses],
                'cpu': node.status.capacity.get('cpu'),
                'memory': node.status.capacity.get('memory')
            }
            for node in nodes
        ]
        return jsonify(node_info)
    except Exception as e:
        logging.error(f"❌ Error fetching node info: {str(e)}")
        return jsonify({'error': 'Failed to fetch node information'}), 500

# Pod Resource Usage
@app.route('/pod_metrics', methods=['GET'])
def get_pod_metrics():
    namespace = request.args.get('namespace', 'default')
    try:
        metrics_api = client.CustomObjectsApi()
        metrics = metrics_api.list_namespaced_custom_object(
            group="metrics.k8s.io",
            version="v1beta1",
            namespace=namespace,
            plural="pods"
        )
        return jsonify(metrics)
    except ApiException as e:
        logging.warning("📉 Metrics server might not be installed or accessible.")
        return jsonify({'error': 'Failed to fetch pod metrics', 'details': str(e)}), 500

# Trivy Image Scanner
@app.route('/scan_image', methods=['POST'])
def scan_image():
    data = request.get_json()
    image = data.get('container_id')

    if not image:
        return jsonify({'error': 'container_id is required'}), 400

    logging.info(f"🔍 Scanning container image: {image}")

    try:
        command = ['trivy', 'image', '--format', 'json', image]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return jsonify({'scan_results': result.stdout})
    except subprocess.CalledProcessError as e:
        logging.error(f"❌ Trivy scan failed: {e.stderr}")
        return jsonify({'error': 'Trivy scan failed', 'details': e.stderr}), 500
    except Exception as e:
        logging.error(f"❌ Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

# Service-to-Pod Mapping
@app.route('/service_pod_mapping', methods=['GET'])
def get_service_pod_mapping():
    namespace = request.args.get('namespace', 'default')
    try:
        core_v1 = client.CoreV1Api()
        
        # Get all services in the namespace
        services = core_v1.list_namespaced_service(namespace)
        service_pod_mapping = []
        
        for service in services.items:
            service_info = {
                'name': service.metadata.name,
                'type': service.spec.type,
                'cluster_ip': service.spec.cluster_ip,
                'ports': [],
                'pods': []
            }
            
            # Get service ports
            if service.spec.ports:
                for port in service.spec.ports:
                    service_info['ports'].append({
                        'port': port.port,
                        'target_port': port.target_port,
                        'protocol': port.protocol
                    })
            
            # Get pods that match the service selector
            if service.spec.selector:
                # Convert selector dict to label selector string
                label_selector = ",".join([f"{k}={v}" for k, v in service.spec.selector.items()])
                
                try:
                    pods = core_v1.list_namespaced_pod(namespace, label_selector=label_selector)
                    
                    for pod in pods.items:
                        pod_info = {
                            'name': pod.metadata.name,
                            'status': pod.status.phase,
                            'ip': pod.status.pod_ip,
                            'ready': False,
                            'restarts': 0
                        }
                        
                        # Check if pod is ready
                        if pod.status.conditions:
                            for condition in pod.status.conditions:
                                if condition.type == 'Ready':
                                    pod_info['ready'] = condition.status == 'True'
                        
                        # Get restart count
                        if pod.status.container_statuses:
                            for container in pod.status.container_statuses:
                                pod_info['restarts'] = container.restart_count
                        
                        service_info['pods'].append(pod_info)
                        
                except ApiException as e:
                    logging.warning(f"⚠️ Could not fetch pods for service {service.metadata.name}: {e.reason}")
                    service_info['pods'] = []
            
            service_pod_mapping.append(service_info)
        
        return jsonify({
            'namespace': namespace,
            'services': service_pod_mapping
        })
        
    except ApiException as e:
        logging.error(f"❌ Kubernetes API error: {e.reason}")
        return jsonify({'error': f"Kubernetes API error: {e.reason}"}), 500
    except Exception as e:
        logging.error(f"❌ Error fetching service-pod mapping: {str(e)}")
        return jsonify({'error': 'Failed to fetch service-pod mapping'}), 500

# Pod Health & Restart Tracking
@app.route('/pod_health', methods=['GET'])
def get_pod_health():
    namespace = request.args.get('namespace', 'default')
    status_filter = request.args.get('status', '')  # Optional status filter
    
    try:
        core_v1 = client.CoreV1Api()
        pods = core_v1.list_namespaced_pod(namespace)
        
        pod_health_data = []
        
        for pod in pods.items:
            pod_info = {
                'name': pod.metadata.name,
                'status': pod.status.phase,
                'ip': pod.status.pod_ip,
                'ready': False,
                'restarts': 0,
                'uptime': None,
                'containers': [],
                'labels': pod.metadata.labels or {},
                'creation_timestamp': pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None
            }
            
            # Check if pod is ready
            if pod.status.conditions:
                for condition in pod.status.conditions:
                    if condition.type == 'Ready':
                        pod_info['ready'] = condition.status == 'True'
            
            # Get container details and restart counts
            if pod.status.container_statuses:
                for container in pod.status.container_statuses:
                    container_info = {
                        'name': container.name,
                        'ready': container.ready,
                        'restart_count': container.restart_count,
                        'state': 'unknown',
                        'state_reason': None,
                        'state_message': None
                    }
                    
                    # Get container state details
                    if container.state:
                        if container.state.running:
                            container_info['state'] = 'running'
                            container_info['state_reason'] = 'Running'
                            container_info['state_message'] = f"Started at {container.state.running.started_at.isoformat()}"
                        elif container.state.waiting:
                            container_info['state'] = 'waiting'
                            container_info['state_reason'] = container.state.waiting.reason
                            container_info['state_message'] = container.state.waiting.message
                        elif container.state.terminated:
                            container_info['state'] = 'terminated'
                            container_info['state_reason'] = container.state.terminated.reason
                            container_info['state_message'] = container.state.terminated.message
                    
                    pod_info['containers'].append(container_info)
                    
                    # Use the highest restart count among containers
                    pod_info['restarts'] = max(pod_info['restarts'], container.restart_count)
            
            # Calculate uptime if pod is running
            if pod.status.start_time:
                from datetime import datetime, timezone
                start_time = pod.status.start_time.replace(tzinfo=timezone.utc)
                current_time = datetime.now(timezone.utc)
                uptime_delta = current_time - start_time
                
                # Format uptime
                days = uptime_delta.days
                hours, remainder = divmod(uptime_delta.seconds, 3600)
                minutes, seconds = divmod(remainder, 60)
                
                if days > 0:
                    pod_info['uptime'] = f"{days}d {hours}h {minutes}m"
                elif hours > 0:
                    pod_info['uptime'] = f"{hours}h {minutes}m"
                else:
                    pod_info['uptime'] = f"{minutes}m {seconds}s"
            
            # Apply status filter if specified
            if status_filter and status_filter.lower() != 'all':
                if status_filter.lower() == 'unhealthy':
                    # Show pods that are not running or have high restart counts
                    if pod_info['status'].lower() != 'running' or pod_info['restarts'] > 0:
                        pod_health_data.append(pod_info)
                elif status_filter.lower() == 'crashloopbackoff':
                    # Show pods with CrashLoopBackOff state
                    has_crashloop = any(container['state_reason'] == 'CrashLoopBackOff' 
                                      for container in pod_info['containers'])
                    if has_crashloop:
                        pod_health_data.append(pod_info)
                elif status_filter.lower() == 'pending':
                    # Show pending pods
                    if pod_info['status'].lower() == 'pending':
                        pod_health_data.append(pod_info)
                elif status_filter.lower() == 'failed':
                    # Show failed pods
                    if pod_info['status'].lower() == 'failed':
                        pod_health_data.append(pod_info)
                else:
                    # Show pods matching specific status
                    if pod_info['status'].lower() == status_filter.lower():
                        pod_health_data.append(pod_info)
            else:
                # No filter, show all pods
                pod_health_data.append(pod_info)
        
        return jsonify({
            'namespace': namespace,
            'pods': pod_health_data,
            'total_pods': len(pod_health_data),
            'filter': status_filter
        })
        
    except ApiException as e:
        logging.error(f"❌ Kubernetes API error: {e.reason}")
        return jsonify({'error': f"Kubernetes API error: {e.reason}"}), 500
    except Exception as e:
        logging.error(f"❌ Error fetching pod health: {str(e)}")
        return jsonify({'error': 'Failed to fetch pod health information'}), 500

# Live Event Stream
@app.route('/events', methods=['GET'])
def get_events():
    namespace = request.args.get('namespace', 'default')
    event_type = request.args.get('type', '')  # Warning, Normal, etc.
    resource_kind = request.args.get('kind', '')  # Pod, Service, etc.
    search_query = request.args.get('search', '')  # Substring search
    limit = request.args.get('limit', '100')  # Limit number of events
    
    try:
        core_v1 = client.CoreV1Api()
        events = core_v1.list_namespaced_event(namespace, limit=int(limit))
        
        event_data = []
        
        for event in events.items:
            # Get involved object details
            involved_object = event.involved_object
            resource_name = involved_object.name if involved_object else 'Unknown'
            resource_kind_type = involved_object.kind if involved_object else 'Unknown'
            
            # Format timestamp
            timestamp = event.last_timestamp.isoformat() if event.last_timestamp else 'Unknown'
            
            # Get event type and reason
            event_type_value = event.type if event.type else 'Unknown'
            reason = event.reason if event.reason else 'Unknown'
            
            # Get message
            message = event.message if event.message else 'No message'
            
            # Apply filters
            if event_type and event_type.lower() != 'all':
                if event_type.lower() != event_type_value.lower():
                    continue
            
            if resource_kind and resource_kind.lower() != 'all':
                if resource_kind.lower() != resource_kind_type.lower():
                    continue
            
            if search_query:
                search_lower = search_query.lower()
                if (search_lower not in message.lower() and 
                    search_lower not in reason.lower() and 
                    search_lower not in resource_name.lower()):
                    continue
            
            event_info = {
                'timestamp': timestamp,
                'type': event_type_value,
                'reason': reason,
                'resource_kind': resource_kind_type,
                'resource_name': resource_name,
                'message': message,
                'count': event.count if event.count else 1,
                'first_timestamp': event.first_timestamp.isoformat() if event.first_timestamp else None,
                'last_timestamp': event.last_timestamp.isoformat() if event.last_timestamp else None
            }
            
            event_data.append(event_info)
        
        # Sort events by timestamp (newest first)
        event_data.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'namespace': namespace,
            'events': event_data,
            'total_events': len(event_data),
            'filters': {
                'type': event_type,
                'kind': resource_kind,
                'search': search_query
            }
        })
        
    except ApiException as e:
        logging.error(f"❌ Kubernetes API error: {e.reason}")
        return jsonify({'error': f"Kubernetes API error: {e.reason}"}), 500
    except Exception as e:
        logging.error(f"❌ Error fetching events: {str(e)}")
        return jsonify({'error': 'Failed to fetch events'}), 500

# Cluster Metrics
@app.route('/cluster_metrics', methods=['GET'])
def get_cluster_metrics():
    try:
        core_v1 = client.CoreV1Api()
        version_api = client.VersionApi()
        
        # Get cluster version with error handling
        try:
            version_info = version_api.get_code()
            cluster_version = {
                'major': version_info.major,
                'minor': version_info.minor,
                'git_version': version_info.git_version,
                'platform': version_info.platform
            }
        except Exception as e:
            logging.warning(f"⚠️ Could not fetch cluster version: {str(e)}")
            cluster_version = {
                'major': 'Unknown',
                'minor': 'Unknown',
                'git_version': 'Unknown',
                'platform': 'Unknown'
            }
        
        # Get nodes information
        nodes = core_v1.list_node()
        
        # Get pods across all namespaces for resource calculation
        all_pods = core_v1.list_pod_for_all_namespaces()
        
        # Calculate cluster-wide metrics
        total_nodes = len(nodes.items)
        ready_nodes = len([node for node in nodes.items if node.status.conditions and any(cond.type == 'Ready' and cond.status == 'True' for cond in node.status.conditions)])
        total_pods = len(all_pods.items)
        running_pods = len([pod for pod in all_pods.items if pod.status.phase == 'Running'])
        
        # Get node resource information
        node_metrics = []
        for node in nodes.items:
            node_info = {
                'name': node.metadata.name,
                'status': 'Ready' if node.status.conditions and any(cond.type == 'Ready' and cond.status == 'True' for cond in node.status.conditions) else 'NotReady',
                'architecture': node.status.node_info.architecture if node.status.node_info else 'Unknown',
                'kubelet_version': node.status.node_info.kubelet_version if node.status.node_info else 'Unknown',
                'os': node.status.node_info.operating_system if node.status.node_info else 'Unknown',
                'capacity': {
                    'cpu': node.status.capacity.get('cpu', 'Unknown') if node.status.capacity else 'Unknown',
                    'memory': node.status.capacity.get('memory', 'Unknown') if node.status.capacity else 'Unknown',
                    'pods': node.status.capacity.get('pods', 'Unknown') if node.status.capacity else 'Unknown'
                },
                'allocatable': {
                    'cpu': node.status.allocatable.get('cpu', 'Unknown') if node.status.allocatable else 'Unknown',
                    'memory': node.status.allocatable.get('memory', 'Unknown') if node.status.allocatable else 'Unknown',
                    'pods': node.status.allocatable.get('pods', 'Unknown') if node.status.allocatable else 'Unknown'
                }
            }
            node_metrics.append(node_info)
        
        return jsonify({
            'cluster_version': cluster_version,
            'nodes': {
                'total': total_nodes,
                'ready': ready_nodes,
                'not_ready': total_nodes - ready_nodes
            },
            'pods': {
                'total': total_pods,
                'running': running_pods,
                'other': total_pods - running_pods
            },
            'node_details': node_metrics
        })
        
    except ApiException as e:
        logging.error(f"❌ Kubernetes API error: {e.reason}")
        return jsonify({'error': f"Kubernetes API error: {e.reason}"}), 500
    except Exception as e:
        logging.error(f"❌ Error fetching cluster metrics: {str(e)}")
        return jsonify({'error': 'Failed to fetch cluster metrics'}), 500

# Start the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=FLASK_DEBUG)
