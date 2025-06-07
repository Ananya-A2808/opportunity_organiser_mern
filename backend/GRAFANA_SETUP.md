# Grafana Setup Instructions for MERN Backend Metrics

This document provides instructions to set up Grafana to visualize Prometheus metrics exposed by the MERN backend.

## Prerequisites

- Prometheus is running and scraping metrics from the backend at `http://localhost:5000/metrics`.
- Grafana is installed and running.

## Add Prometheus Data Source in Grafana

1. Open Grafana UI (usually at `http://localhost:3000`).
2. Log in with your credentials.
3. Go to **Configuration** (gear icon) > **Data Sources**.
4. Click **Add data source**.
5. Select **Prometheus**.
6. Set the URL to your Prometheus server, e.g., `http://localhost:9090`.
7. Click **Save & Test** to verify the connection.

## Import or Create Dashboards

You can create custom dashboards or import existing ones:

### Import Existing Dashboards

- Go to **Create** (plus icon) > **Import**.
- Use dashboard IDs from [Grafana Dashboards](https://grafana.com/grafana/dashboards/) such as:
  - Node Exporter Full (ID: 1860)
  - Prometheus Stats (ID: 3662)
- Adjust queries to match your metrics if needed.

### Create Custom Dashboard

- Create panels with Prometheus queries such as:
  - `node_cpu_seconds_total`
  - `node_memory_MemAvailable_bytes`
  - `process_cpu_seconds_total`
  - `process_resident_memory_bytes`
  - Custom metrics exposed by your backend

## Additional Tips

- Set refresh interval to 15s or as needed.
- Use alerting features to monitor critical metrics.

## Summary

- Backend exposes metrics at `/metrics`.
- Prometheus scrapes metrics using the provided config.
- Grafana visualizes metrics from Prometheus data source.

For any issues, consult the official Prometheus and Grafana documentation.
