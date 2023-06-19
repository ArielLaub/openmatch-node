helm install open-match --create-namespace --namespace open-match open-match/open-match \
  --set open-match-customize.enabled=true \
  --set open-match-customize.evaluator.enabled=true \
  --set open-match-override.enabled=true \
  --set query.replicas=1 \
  --set frontend.replicas=1 \
  --set backend.replicas=1 \

