#!/bin/bash

# =============================================================================
# Kubernetes Debug Script for Runflare Deployment
# =============================================================================
# Deployment: test-kww-deploy
# Namespace: dreammaker
# Ingress: test-unp-ingress
# PVC: test-lrk-claim
# =============================================================================

set -e

echo "🔍 Starting Kubernetes Debug Script for dreammaker namespace..."
echo "=================================================="
echo

# =============================================================================
# STEP 1: CHECK POD STATUS
# =============================================================================
echo "📦 STEP 1: Checking Pod Status"
echo "------------------------------"

# List all pods in the dreammaker namespace
echo "→ Getting all pods in dreammaker namespace:"
kubectl get pods -n dreammaker

echo
# Get detailed pod information for troubleshooting
echo "→ Describing pods (will show events, conditions, and resource usage):"
PODS=$(kubectl get pods -n dreammaker --no-headers -o custom-columns=":metadata.name" 2>/dev/null || echo "")
if [ -n "$PODS" ]; then
    for pod in $PODS; do
        echo "  📋 Describing pod: $pod"
        kubectl describe pod $pod -n dreammaker
        echo
    done
else
    echo "  ⚠️  No pods found in dreammaker namespace"
fi

echo
# Get recent logs from pods
echo "→ Getting recent logs from pods (last 50 lines):"
if [ -n "$PODS" ]; then
    for pod in $PODS; do
        echo "  📄 Logs for pod: $pod"
        kubectl logs $pod -n dreammaker --tail=50 2>/dev/null || echo "    ⚠️  Could not retrieve logs for $pod"
        echo
    done
else
    echo "  ⚠️  No pods found to retrieve logs from"
fi

echo "=================================================="
echo

# =============================================================================
# STEP 2: CHECK DEPLOYMENT & REPLICASET
# =============================================================================
echo "🚀 STEP 2: Checking Deployment & ReplicaSet"
echo "--------------------------------------------"

# Check deployment status
echo "→ Getting deployment status:"
kubectl get deploy test-kww-deploy -n dreammaker

echo
# Get detailed deployment information
echo "→ Describing deployment (shows replica status, conditions, and events):"
kubectl describe deploy test-kww-deploy -n dreammaker

echo
# Check ReplicaSets to understand scaling issues
echo "→ Getting all ReplicaSets in dreammaker namespace:"
kubectl get rs -n dreammaker

echo "=================================================="
echo

# =============================================================================
# STEP 3: CHECK PVC & VOLUME
# =============================================================================
echo "💾 STEP 3: Checking PVC & Volume"
echo "---------------------------------"

# Check PVC status
echo "→ Getting PVC status:"
kubectl get pvc test-lrk-claim -n dreammaker

echo
# Get detailed PVC information
echo "→ Describing PVC (shows binding status, capacity, and events):"
kubectl describe pvc test-lrk-claim -n dreammaker

echo
# Check all Persistent Volumes
echo "→ Getting all Persistent Volumes (cluster-wide):"
kubectl get pv

echo "=================================================="
echo

# =============================================================================
# STEP 4: CHECK INGRESS & SERVICE
# =============================================================================
echo "🌐 STEP 4: Checking Ingress & Service"
echo "--------------------------------------"

# Check ingress status
echo "→ Getting ingress status:"
kubectl get ingress test-unp-ingress -n dreammaker

echo
# Get detailed ingress information
echo "→ Describing ingress (shows rules, backend services, and events):"
kubectl describe ingress test-unp-ingress -n dreammaker

echo
# Check all services in namespace
echo "→ Getting all services in dreammaker namespace:"
kubectl get svc -n dreammaker

echo "=================================================="
echo

# =============================================================================
# STEP 5: EXTERNAL ACCESS TEST
# =============================================================================
echo "🔗 STEP 5: External Access Test"
echo "--------------------------------"

# Extract and display external domain from ingress
echo "→ Extracting external domain from ingress:"
DOMAIN=$(kubectl get ingress test-unp-ingress -n dreammaker -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "")
if [ -n "$DOMAIN" ]; then
    echo "  🌍 External domain found: $DOMAIN"
    echo
    echo "→ To test external connectivity, run:"
    echo "  curl -v https://$DOMAIN"
    echo
    echo "→ If the above curl command fails, check:"
    echo "  • DNS propagation: nslookup $DOMAIN"
    echo "  • Firewall rules on Runflare cluster"
    echo "  • SSL certificate status"
    echo "  • Ingress controller status: kubectl get pods -n ingress-nginx (or relevant ingress namespace)"
else
    echo "  ⚠️  Could not extract domain from ingress. Check ingress configuration."
    echo
    echo "→ Manual connectivity test:"
    echo "  1. Get the ingress external IP:"
    echo "     kubectl get ingress test-unp-ingress -n dreammaker -o wide"
    echo "  2. Test with IP if domain is not available:"
    echo "     curl -v -H 'Host: <your-domain>' http://<external-ip>"
fi

echo
echo "=================================================="
echo "✅ Debug script completed!"
echo "=================================================="
echo
echo "📋 Summary of what was checked:"
echo "• Pod status, descriptions, and logs"
echo "• Deployment and ReplicaSet status"
echo "• PVC and PV status"
echo "• Ingress and Service configuration"
echo "• External access information"
echo
echo "💡 Next steps if issues found:"
echo "• Review pod events and logs for error messages"
echo "• Check resource quotas and limits"
echo "• Verify service selectors match pod labels"
echo "• Ensure ingress controller is running"
echo "• Validate DNS and firewall configuration"