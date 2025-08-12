# Firecrawl Helm Chart

This Helm chart deploys the Firecrawl stack to a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name `my-firecrawl`:

```bash
helm install my-firecrawl ./firecrawl
```

## Uninstalling the Chart

To uninstall/delete the `my-firecrawl` release:

```bash
helm uninstall my-firecrawl
```

## Configuration

The following table lists the configurable parameters of the Firecrawl chart and their default values.

| Parameter | Description | Default |
| --- | --- | --- |
| `nameOverride` | Override the name of the chart. | `""` |
| `fullnameOverride` | Override the full name of the release. | `""` |
| `imagePullSecrets` | Secrets for pulling images from a private registry. | `[]` |
| `api.replicaCount` | Number of API replicas. | `1` |
| `api.image.repository` | API image repository. | `ghcr.io/mendableai/firecrawl` |
| `api.image.tag` | API image tag. | `"latest"` |
| `worker.replicaCount` | Number of worker replicas. | `1` |
| `worker.image.repository`| Worker image repository. | `ghcr.io/mendableai/firecrawl` |
| `worker.image.tag` | Worker image tag. | `"latest"` |
| `playwright.enabled`| Enable the Playwright service. | `true` |
| `redis.enabled` | Enable the in-cluster Redis instance. | `true` |
| `config` | Application configuration values. | (see `values.yaml`) |
| `secrets.create` | Create a new secret with values from `secrets.values`. | `true` |
| `secrets.existingSecret`| Use an existing secret instead of creating a new one. | `""` |
| `secrets.values`| Key-value pairs of secrets to create. | (see `values.yaml`) |

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example:

```bash
helm install my-firecrawl ./firecrawl --set api.replicaCount=2
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while installing the chart. For example:

```bash
helm install my-firecrawl ./firecrawl -f my-values.yaml
```

## Secrets

It is recommended to manage secrets outside of `values.yaml` for production environments. You can create a secret manually:

```bash
kubectl create secret generic my-firecrawl-secrets \
  --from-literal=OPENAI_API_KEY='your-key' \
  --from-literal=BULL_AUTH_KEY='your-password'
```

And then install the chart with `secrets.create=false` and `secrets.existingSecret=my-firecrawl-secrets`:

```bash
helm install my-firecrawl ./firecrawl \
  --set secrets.create=false \
  --set secrets.existingSecret=my-firecrawl-secrets
```

## Testing the Deployment

The chart includes a test to verify that the API is running. To run the test after installation:

```bash
helm test my-firecrawl
```
