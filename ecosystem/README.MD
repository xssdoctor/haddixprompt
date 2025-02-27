# Verified LLM DevOps Infrastructure Security Assessment Table (AI Generated with RAG from Security Sources)

| Software | Purpose | Default Port | Web Dashboard Title | Authentication | Verified CVEs |
|----------|---------|--------------|---------------------|----------------|--------------|
| **MLflow** | ML experiment tracking & model registry | 5000 | "MLflow UI" | No (default), Yes (configurable) | CVE-2023-1177 (remote code execution via artifact upload), CVE-2022-41553 (SQL injection), CVE-2023-41334 (path traversal) |
| **Weights & Biases** | ML experiment tracking | 8080 | "Weights & Biases" | Yes (API key) | No officially documented CVEs in NVD |
| **Kubeflow** | ML workflows on Kubernetes | 8080 | "Kubeflow" | Yes (OAuth, configurable) | CVE-2021-29428 (XSS vulnerability), CVE-2020-15129 (access control issue) |
| **Kubeflow Pipelines** | ML workflow orchestration | 8080 (Argo UI) | "Argo Workflows" | Yes (K8s RBAC/Dex/OIDC) | Inherits Argo vulnerabilities like CVE-2022-45402 (privilege escalation) |
| **KServe (InferenceService)** | Model serving platform | 8080 | "KServe Dashboard" | No (typically) | No officially documented CVEs in NVD |
| **Ray Dashboard** | Distributed computing framework | 8265 | "Ray Dashboard" | No | No officially documented CVEs in NVD |
| **Slurm** | HPC workload manager | 9090 | "Slurm Workload Manager" | Yes (basic auth) | CVE-2022-4291 (privilege escalation), CVE-2021-31215 (RCE) |
| **DVC Studio** | Data/model version control | 8080 | "DVC Studio" | Yes (configurable) | No officially documented CVEs in NVD |
| **Determined AI** | Training platform | 8080 | "Determined AI" | Yes (basic auth) | No officially documented CVEs in NVD |
| **Prometheus** | Monitoring | 9090 | "Prometheus Time Series Collection & Processing Server" | No | CVE-2021-29622 (open redirect), CVE-2019-3826 (CSRF vulnerability) |
| **Grafana** | Metrics visualization | 3000 | "Grafana" | Yes (built-in) | CVE-2021-43798 (path traversal), CVE-2022-21703 (arbitrary file read), CVE-2020-13379 (path traversal) |
| **Jenkins** | CI/CD | 8080 | "Dashboard [Jenkins]" | Yes (form-based) | CVE-2024-23897 (file read leading to RCE), CVE-2023-27898 (SSRF), CVE-2023-27905 (XSS) |
| **GitLab** | Source code management | 80/443 | "GitLab" | Yes (form-based) | CVE-2023-2825 (path traversal), CVE-2022-1162 (hardcoded password), CVE-2021-22205 (RCE) |
| **Kubernetes Dashboard** | K8s management UI | 8001/443/8443 | "Kubernetes Dashboard" | Yes (token-based) | CVE-2018-18264 (authentication bypass), CVE-2019-9946 (CSRF) |
| **Jupyter Hub** | Notebook management | 8000 | "JupyterHub" | Yes (form-based) | CVE-2022-39286 (path traversal), CVE-2020-26247 (XSS) |
| **Docker Registry** | Container registry | 5000 | "Docker Registry" | Optional | CVE-2022-36884 (authentication bypass), CVE-2020-14300 (denial of service) |
| **Docker Swarm/UI** | Container orchestration | 8080/443 | "Docker Swarm Visualizer" | No | CVE-2020-13091 (RCE) |
| **Airflow** | Workflow management | 8080 | "Airflow - DAGs" | Yes (configurable) | CVE-2020-11978 (RCE), CVE-2020-17526 (RCE), CVE-2020-13927 (info disclosure) |
| **Elasticsearch** | Log/data storage | 9200 | "Elasticsearch" | No (default) | CVE-2021-22145 (path traversal), CVE-2015-1427 (Groovy sandbox bypass RCE) |
| **Kibana** | Log visualization | 5601 | "Kibana" | Yes (if configured) | CVE-2019-7609 (RCE), CVE-2018-17246 (path traversal) |
| **MinIO** | Object storage | 9000 | "MinIO" | Yes (access key) | CVE-2022-41318 (credential leakage) |
| **Vault** | Secret management | 8200 | "Vault" | Yes (token-based) | CVE-2022-41316 (JWT claim verification bypass), CVE-2020-16251 (path traversal) |
| **ZooKeeper** | Distributed coordination | 8080 | "ZooKeeper" | No (default) | CVE-2021-21409 (unauth access), CVE-2020-25649 (XXE) |
| **RabbitMQ** | Message broker | 15672 | "RabbitMQ Management" | Yes (basic auth) | CVE-2022-37581 (DoS), CVE-2021-22116 (auth bypass) |
| **Hugging Face Hub UI** | Model hub | 8080 | "Hugging Face" | Yes (API token) | No officially documented CVEs in NVD |
| **Seldon Core** | Model serving | 8080 | "Seldon Core" | Optional | No officially documented CVEs in NVD |
| **TensorFlow** | ML framework dashboards | 6006 | "TensorBoard" | No | CVE-2023-27579 (code execution), CVE-2021-41228 (DoS) |
| **BentoML** | Model serving | 3000 | "BentoML Dashboard" | No (default) | No officially documented CVEs in NVD |
| **ClearML** | ML ops platform | 8080 | "ClearML" | Yes (basic auth) | No officially documented CVEs in NVD |
| **Triton Inference Server** | Model serving | 8000 | "Triton Inference Server" | No (default) | No officially documented CVEs in NVD |
| **OpenFaaS** | Serverless functions | 8080 | "OpenFaaS Portal" | Yes (basic auth) | CVE-2021-27758 (authentication bypass) |
| **KEDA** | Kubernetes Event-driven Autoscaling | 8080 | "KEDA" | Yes (via Kubernetes) | No officially documented CVEs in NVD |
| **Argo CD** | GitOps CD tool | 8080 | "Argo CD" | Yes (OAuth) | CVE-2022-31022 (auth bypass), CVE-2022-31016 (SSRF), CVE-2022-24348 (path traversal) |
| **Metaflow** | Data science framework | 3000 | "Metaflow" | No (default) | No officially documented CVEs in NVD |
| **Graylog** | Log management | 9000 | "Graylog Web Interface" | Yes | CVE-2020-15813 (XSS), CVE-2019-12477 (auth bypass) |
| **SonarQube** | Code quality | 9000 | "SonarQube" | Yes | CVE-2020-27986 (auth bypass), CVE-2020-1960 (XSS) |
| **Harbor** | Container registry | 80/443 | "Harbor" | Yes | CVE-2021-43108 (CSRF), CVE-2022-31660 (SSRF) |
| **Portainer** | Container management | 9000/9443 | "Portainer" | Yes | CVE-2022-27337 (CSRF), CVE-2020-5215 (auth bypass) |
| **Nagios Core** | Monitoring | 80 | "Nagios Core" | Yes | CVE-2020-35578 (RCE), CVE-2020-28648 (XSS) |
| **H2O.ai** | AutoML platform | 54321 | "H2O Flow" | No (default) | CVE-2022-45706 (arbitrary file read) |

## Cloud AI/ML Platforms

| Cloud Platform | Service | Authentication | Notable Security Concerns |
|---------------|---------|----------------|---------------------------|
| **AWS** | SageMaker | Yes (IAM) | Role permission misconfigurations, notebook instance escape |
| **Azure** | Azure ML | Yes (AAD) | Secret management issues, access token exposure |
| **Google Cloud** | Vertex AI | Yes (IAM) | Service account over-permission, notebook authorization |
| **IBM** | watsonx.ai | Yes (IAM) | API key exposure, service integration vulnerabilities |
| **BigML** | ML Platform | Yes (API key) | Key exposure, insufficient access controls |

## Additional Security Notes

1. **Default Configurations**: Many of these tools have security vulnerabilities in their default configurations, especially when deployed internally without proper hardening.

2. **Authentication Bypass**: Tools marked with authentication can often be bypassed through misconfigurations or by exploiting known vulnerabilities.

3. **Port Exposure**: Internal deployments often expose these ports only on internal networks, but they can be accessible through VPNs or improperly configured networks.

4. **Temporary Deployments**: During development phases, many teams deploy these tools with minimal security controls, planning to "secure them later" before production.

5. **Interconnections**: These tools often have trust relationships with each other, allowing lateral movement once one system is compromised.

6. **API Keys and Secrets**: Look for hardcoded credentials in configuration files, especially in CI/CD pipelines.

7. **Log Files**: Many of these tools generate verbose logs that may contain sensitive information, including tokens and credentials.

8. **Container Escapes**: Tools running in containers may have vulnerabilities that allow container escapes, especially when privileged containers are used.

9. **ML-specific Risks**: Model registries can be backdoored, ML pipelines can introduce supply chain attacks, and notebook code execution can be leveraged for persistence.

10. **Cloud Platforms**: Even cloud-based ML platforms introduce risks through misconfigured IAM permissions, exposed API keys, and insufficient access controls.
