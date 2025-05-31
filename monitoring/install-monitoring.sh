#!/bin/bash

# Intelligent Monitoring System Installation Script
# This script sets up the monitoring system as a service

set -e

echo "🚀 Installing Intelligent Monitoring System..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  This script should not be run as root for security reasons"
   echo "   Please run as a regular user with sudo privileges"
   exit 1
fi

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Create monitoring user if it doesn't exist
if ! id "monitoring" &>/dev/null; then
    echo "👤 Creating monitoring user..."
    sudo useradd -r -s /bin/false -d /opt/monitoring monitoring
fi

# Create directories
echo "📁 Creating directories..."
sudo mkdir -p /opt/monitoring
sudo mkdir -p /var/log/monitoring
sudo mkdir -p /etc/monitoring

# Copy files
echo "📋 Copying monitoring files..."
sudo cp -r . /opt/monitoring/
sudo chown -R monitoring:monitoring /opt/monitoring
sudo chown -R monitoring:monitoring /var/log/monitoring

# Install dependencies
echo "📦 Installing dependencies..."
cd /opt/monitoring
sudo -u monitoring npm install

# Create systemd service
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/intelligent-monitoring.service > /dev/null <<EOF
[Unit]
Description=Intelligent Monitoring System
After=network.target
Wants=network.target

[Service]
Type=simple
User=monitoring
Group=monitoring
WorkingDirectory=/opt/monitoring
ExecStart=/usr/bin/node monitor.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=intelligent-monitoring

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/monitoring /var/log/monitoring
CapabilityBoundingSet=CAP_NET_BIND_SERVICE

# Environment
Environment=NODE_ENV=production
Environment=LOG_LEVEL=info

[Install]
WantedBy=multi-user.target
EOF

# Create configuration file
echo "🔧 Creating configuration..."
sudo tee /etc/monitoring/config.json > /dev/null <<EOF
{
  "monitoring": {
    "interval": 10000,
    "fastInterval": 2000,
    "reportInterval": 300000
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
    "webhookUrl": null
  },
  "actions": {
    "autoKillHighCPU": false,
    "autoClearCache": true,
    "autoCleanupTemp": true,
    "autoRestartServices": false
  }
}
EOF

sudo chown monitoring:monitoring /etc/monitoring/config.json

# Create log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/intelligent-monitoring > /dev/null <<EOF
/var/log/monitoring/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 monitoring monitoring
    postrotate
        systemctl reload intelligent-monitoring || true
    endscript
}
EOF

# Set up firewall rules (if ufw is available)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    # Add any necessary firewall rules here
fi

# Enable and start service
echo "🎯 Enabling and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable intelligent-monitoring
sudo systemctl start intelligent-monitoring

# Wait a moment and check status
sleep 3
if sudo systemctl is-active --quiet intelligent-monitoring; then
    echo "✅ Intelligent Monitoring System installed and started successfully!"
    echo ""
    echo "📊 Service Status:"
    sudo systemctl status intelligent-monitoring --no-pager -l
    echo ""
    echo "🔍 Useful Commands:"
    echo "   View logs:    sudo journalctl -u intelligent-monitoring -f"
    echo "   Stop service: sudo systemctl stop intelligent-monitoring"
    echo "   Start service: sudo systemctl start intelligent-monitoring"
    echo "   Restart service: sudo systemctl restart intelligent-monitoring"
    echo "   View status:  sudo systemctl status intelligent-monitoring"
    echo ""
    echo "📁 Important Paths:"
    echo "   Service files: /opt/monitoring/"
    echo "   Configuration: /etc/monitoring/config.json"
    echo "   Logs: /var/log/monitoring/"
    echo "   Reports: /opt/monitoring/monitoring/reports/"
    echo ""
    echo "⚙️  Configuration:"
    echo "   Edit /etc/monitoring/config.json to customize settings"
    echo "   Restart service after configuration changes"
else
    echo "❌ Failed to start monitoring service"
    echo "📋 Check logs with: sudo journalctl -u intelligent-monitoring -n 50"
    exit 1
fi

echo ""
echo "🎉 Installation complete! The monitoring system is now running."
echo "   It will automatically start on boot and monitor your system 24/7."
echo ""
echo "🔔 To set up external alerts (email, Slack, etc.):"
echo "   1. Edit /etc/monitoring/config.json"
echo "   2. Add webhook URLs or notification endpoints"
echo "   3. Restart the service: sudo systemctl restart intelligent-monitoring"
