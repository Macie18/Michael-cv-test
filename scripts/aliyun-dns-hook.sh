#!/usr/bin/env bash

set -euo pipefail
umask 077

readonly ACTION="${1:-}"
FQDN="${2:-}"
readonly FQDN="${FQDN%.}"
readonly TXT_VALUE="${3:-}"
readonly ROOT_DOMAIN="naidongma.com"

if [[ -z "$ACTION" || -z "$FQDN" || -z "$TXT_VALUE" ]]; then
  echo "Usage: $0 <present|cleanup> <fqdn> <txt-value>" >&2
  exit 2
fi

case "$FQDN" in
  _acme-challenge.naidongma.com|_acme-challenge.www.naidongma.com)
    ;;
  *)
    echo "Refusing to modify an unexpected DNS name: $FQDN" >&2
    exit 2
    ;;
esac

if ! command -v aliyun >/dev/null 2>&1 || ! command -v jq >/dev/null 2>&1; then
  echo "aliyun CLI and jq are required" >&2
  exit 2
fi

readonly RR="${FQDN%.${ROOT_DOMAIN}}"
readonly STATE_ROOT="${RUNNER_TEMP:-/tmp}/naidongma-acme"
readonly STATE_KEY="$(printf '%s\0%s' "$FQDN" "$TXT_VALUE" | sha256sum | awk '{print $1}')"
readonly RECORD_FILE="${STATE_ROOT}/${STATE_KEY}.record-id"
mkdir -p "$STATE_ROOT"

case "$ACTION" in
  present)
    response="$(aliyun alidns add-domain-record \
      --domain-name "$ROOT_DOMAIN" \
      --rr "$RR" \
      --type TXT \
      --value "$TXT_VALUE" \
      --ttl 600 \
      --region cn-hangzhou)"
    record_id="$(jq -er '.RecordId' <<<"$response")"
    printf '%s' "$record_id" > "$RECORD_FILE"
    echo "Created the temporary ACME TXT record for $FQDN"
    ;;
  cleanup)
    if [[ ! -s "$RECORD_FILE" ]]; then
      echo "No temporary ACME record state found for $FQDN; nothing to remove"
      exit 0
    fi
    record_id="$(<"$RECORD_FILE")"
    aliyun alidns delete-domain-record \
      --record-id "$record_id" \
      --region cn-hangzhou >/dev/null
    rm -f "$RECORD_FILE"
    echo "Removed the temporary ACME TXT record for $FQDN"
    ;;
  *)
    echo "Unsupported action: $ACTION" >&2
    exit 2
    ;;
esac
