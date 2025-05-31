# 🤖 Intelligent Monitoring System

An AI-powered system monitoring solution with automated response capabilities, real-time anomaly detection, and intelligent decision-making.

## 🌟 Features

### 🔍 **Comprehensive Monitoring**
- **System Resources**: CPU, Memory, Disk usage with real-time tracking
- **Network Activity**: Open ports, active connections, external IP monitoring
- **Process Monitoring**: Top CPU/memory consumers, process health
- **Connectivity Tests**: External service reachability, latency monitoring

### 🧠 **AI-Powered Anomaly Detection**
- **Machine Learning**: Statistical anomaly detection with confidence scoring
- **Pattern Recognition**: Learns normal behavior patterns over time
- **Trend Analysis**: Detects memory leaks, CPU spikes, unusual network activity
- **Seasonal Detection**: Identifies recurring patterns and expected variations

### ⚡ **Automated Response System**
- **Intelligent Actions**: Automatically responds to critical situations
- **Escalation Levels**: Progressive response based on severity
- **Self-Healing**: Attempts to resolve issues before alerting humans
- **Customizable Rules**: Configure which actions to take automatically

### 📊 **Advanced Reporting**
- **Real-time Dashboards**: Live system status and metrics
- **Historical Analysis**: Trend analysis and performance insights
- **Alert Management**: Comprehensive alert history and patterns
- **Status Reports**: Automated periodic system health reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Linux/macOS system with standard utilities (`ps`, `netstat`, `df`)
- Sudo privileges for installation

### Installation

1. **Clone or download the monitoring system**
```bash
# If you have the files, navigate to the monitoring directory
cd monitoring
```

2. **Run the installation script**
```bash
./install-monitoring.sh
```

3. **Verify installation**
```bash
sudo systemctl status intelligent-monitoring
```

### Manual Setup (Alternative)

1. **Install dependencies**
```bash
npm install
```

2. **Start monitoring**
```bash
node monitor.js
```

## 📋 Configuration

Edit `/etc/monitoring/config.json` (or `monitoring/config/monitor-config.json` for manual setup):

```json
{
  "monitoring": {
    "interval": 10000,        // Normal monitoring interval (ms)
    "fastInterval": 2000,     // Critical mode interval (ms)
    "reportInterval": 300000  // Status report interval (ms)
  },
  "thresholds": {
    "cpu": { "warning": 70, "critical": 90 },
    "memory": { "warning": 80, "critical": 95 },
    "disk": { "warning": 85, "critical": 95 },
    "connections": { "warning": 200, "critical": 500 }
  },
  "alerts": {
    "enabled": true,
    "logToFile": true,
    "logToConsole": true,
    "webhookUrl": "https://your-webhook-url.com/alerts"
  },
  "actions": {
    "autoKillHighCPU": false,     // Automatically kill high CPU processes
    "autoClearCache": true,       // Clear system cache when memory is high
    "autoCleanupTemp": true,      // Clean temporary files when disk is full
    "autoRestartServices": false  // Restart services automatically
  }
}
```

## 🎯 Automated Response Actions

The system can automatically take these actions when anomalies are detected:

### CPU Issues
- Kill high CPU processes
- Reduce process priorities
- Alert administrators
- Scale resources (if configured)

### Memory Issues
- Clear system cache
- Kill memory-hogging processes
- Restart services
- Alert administrators

### Disk Issues
- Clean temporary files
- Compress log files
- Archive old data
- Alert administrators

### Network/Security Issues
- Block suspicious IPs
- Rate limit connections
- Alert security team
- Enable enhanced monitoring

## 📊 Monitoring Modes

### Normal Mode (Default)
- Standard monitoring interval (10 seconds)
- Regular anomaly detection
- Standard response actions

### Critical Mode (Auto-activated)
- Fast monitoring interval (2 seconds)
- Enhanced anomaly detection
- Aggressive response actions
- Increased alerting

## 🔧 Management Commands

```bash
# Service management
sudo systemctl start intelligent-monitoring
sudo systemctl stop intelligent-monitoring
sudo systemctl restart intelligent-monitoring
sudo systemctl status intelligent-monitoring

# View logs
sudo journalctl -u intelligent-monitoring -f
sudo journalctl -u intelligent-monitoring -n 100

# View reports
ls /opt/monitoring/monitoring/reports/
cat /opt/monitoring/monitoring/reports/status-report-*.json

# View alerts
ls /opt/monitoring/monitoring/alerts/
cat /opt/monitoring/monitoring/alerts/alert-*.json
```

## 📈 Machine Learning Features

### Anomaly Detection Algorithms
- **Statistical Analysis**: Z-score based anomaly detection
- **Trend Analysis**: Exponential smoothing for prediction
- **Pattern Recognition**: Autocorrelation for seasonal patterns
- **Confidence Scoring**: Multi-factor confidence assessment

### Learning Capabilities
- **Baseline Learning**: Automatically learns normal system behavior
- **Adaptive Thresholds**: Adjusts detection sensitivity over time
- **Pattern Memory**: Remembers and recognizes recurring patterns
- **False Positive Reduction**: Improves accuracy with more data

## 🔔 Alert Integration

### Webhook Integration
Set `webhookUrl` in configuration to send alerts to external systems:

```json
{
  "alerts": {
    "webhookUrl": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
  }
}
```

### Custom Alert Handlers
Extend the system by modifying `intelligent-agent.js`:

```javascript
async alertAdmin(anomaly) {
  // Send email
  await this.sendEmail(anomaly);
  
  // Send Slack message
  await this.sendSlackAlert(anomaly);
  
  // Send SMS
  await this.sendSMS(anomaly);
}
```

## 🛡️ Security Considerations

- Runs as dedicated `monitoring` user (not root)
- Limited file system access
- No network privileges beyond monitoring
- Secure log file permissions
- Optional firewall integration

## 📁 File Structure

```
monitoring/
├── monitor.js                 # Main orchestrator
├── system-monitor.js          # Core monitoring functions
├── intelligent-agent.js       # AI decision making
├── ml-anomaly-detector.js     # Machine learning algorithms
├── install-monitoring.sh      # Installation script
├── package.json              # Dependencies
├── README.md                 # This file
├── config/
│   └── monitor-config.json   # Configuration
├── logs/
│   └── errors.log           # Error logs
├── reports/
│   └── status-report-*.json # Status reports
└── alerts/
    └── alert-*.json         # Alert history
```

## 🔬 Advanced Features

### Custom ML Models
The system supports pluggable ML models. Extend `MLAnomalyDetector` to add:
- Deep learning models
- Ensemble methods
- Custom algorithms

### External Integrations
- Prometheus metrics export
- Grafana dashboard integration
- ELK stack log shipping
- Custom webhook handlers

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs
sudo journalctl -u intelligent-monitoring -n 50

# Check permissions
sudo ls -la /opt/monitoring/

# Verify Node.js
node --version
```

### High Resource Usage
```bash
# Check monitoring overhead
top -p $(pgrep -f "node monitor.js")

# Adjust monitoring interval
sudo nano /etc/monitoring/config.json
sudo systemctl restart intelligent-monitoring
```

### False Positives
- Increase training period (more data = better accuracy)
- Adjust thresholds in configuration
- Review and tune ML parameters

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check logs: `sudo journalctl -u intelligent-monitoring -f`
- Review configuration: `/etc/monitoring/config.json`
- Monitor resource usage: `htop` or `top`
- Test connectivity: `ping 8.8.8.8`

---

**🎉 Enjoy your intelligent monitoring system!** 

The system learns your environment and gets smarter over time. Give it a few hours to learn your baseline patterns for optimal performance.
