#!/usr/bin/env bash
set -Eeuo pipefail

source /etc/youniqlyf/deploy.conf

VERSION="${1:-}"
EXPECTED_SHA256="${2:-}"
if [[ ! "$VERSION" =~ ^[0-9a-f]{40}$ || ! "$EXPECTED_SHA256" =~ ^[0-9a-f]{64}$ ]]; then
  echo "Expected a 40-character commit SHA and 64-character artifact SHA-256." >&2
  exit 2
fi

exec > >(tee -a /var/log/youniqlyf/deploy.log) 2>&1

RELEASES_DIR="/opt/youniqlyf/releases"
RELEASE_DIR="$RELEASES_DIR/$VERSION"
CURRENT_LINK="/opt/youniqlyf/current"
PREVIOUS_RELEASE=""
if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK")"
fi

ARCHIVE="$(mktemp /tmp/youniqlyf-release.XXXXXX.tar.gz)"
TEMP_ENV="$(mktemp /etc/youniqlyf/app-env.XXXXXX.json)"
cleanup() {
  rm -f -- "$ARCHIVE" "$TEMP_ENV"
}
trap cleanup EXIT

aws s3 cp "s3://$ARTIFACT_BUCKET/releases/$VERSION/release.tar.gz" "$ARCHIVE" --region "$AWS_REGION"
printf '%s  %s\n' "$EXPECTED_SHA256" "$ARCHIVE" | sha256sum --check --status
mkdir -p "$RELEASE_DIR"
tar --extract --gzip --file "$ARCHIVE" --directory "$RELEASE_DIR" --no-same-owner

if [[ ! -f "$RELEASE_DIR/server.js" || ! -d "$RELEASE_DIR/migration-tools/node_modules" ]]; then
  echo "Release artifact is missing the standalone server or migration tools." >&2
  exit 1
fi

aws ssm get-parameters-by-path \
  --region "$AWS_REGION" \
  --path "$PARAMETER_PATH" \
  --recursive \
  --with-decryption \
  --output json |
  python3 -c '
import json
import re
import sys

parameters = json.load(sys.stdin).get("Parameters", [])
values = {}
for parameter in parameters:
    key = parameter["Name"].rsplit("/", 1)[-1]
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", key):
        raise SystemExit("Invalid environment variable name in SSM parameter path.")
    values[key] = parameter["Value"]
if not values.get("DATABASE_URL") or not values.get("JWT_SECRET"):
    raise SystemExit("SSM parameters must include DATABASE_URL and JWT_SECRET.")
json.dump(values, sys.stdout)
' >"$TEMP_ENV"

chown root:youniqlyf "$TEMP_ENV"
chmod 0640 "$TEMP_ENV"
mv -f -- "$TEMP_ENV" /etc/youniqlyf/app-env.json

python3 - "$RELEASE_DIR/migration-tools" <<'PY'
import json
import os
import subprocess
import sys

migration_dir = sys.argv[1]
with open("/etc/youniqlyf/app-env.json", encoding="utf-8") as file:
    environment = os.environ | json.load(file)
subprocess.run(
    ["./node_modules/.bin/prisma", "migrate", "deploy"],
    cwd=migration_dir,
    env=environment,
    check=True,
)
PY

mkdir -p "$RELEASE_DIR/.next/cache"
chown -R youniqlyf:youniqlyf "$RELEASE_DIR/.next/cache"

NEXT_LINK="/opt/youniqlyf/current.next"
ln -sfn "$RELEASE_DIR" "$NEXT_LINK"
mv -Tf "$NEXT_LINK" "$CURRENT_LINK"
health_ok=false
if systemctl restart youniqlyf; then
  for attempt in $(seq 1 30); do
    if curl --fail --silent --max-time 3 http://127.0.0.1:4000/api/health >/dev/null; then
      health_ok=true
      break
    fi
    sleep 2
  done
fi

if [[ "$health_ok" != true ]]; then
  echo "The new release failed its local health check." >&2
  if [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
    ln -sfn "$PREVIOUS_RELEASE" "$NEXT_LINK"
    mv -Tf "$NEXT_LINK" "$CURRENT_LINK"
    if ! systemctl restart youniqlyf; then
      echo "The previous release was restored, but its service failed to restart." >&2
      exit 1
    fi
  else
    systemctl stop youniqlyf
  fi
  exit 1
fi

mapfile -t OLD_RELEASES < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | awk 'NR > 5 { $1=""; sub(/^ /, ""); print }')
for old_release in "${OLD_RELEASES[@]}"; do
  case "$old_release" in
    "$RELEASES_DIR"/*)
      if [[ "$old_release" != "$PREVIOUS_RELEASE" && "$old_release" != "$RELEASE_DIR" ]]; then
        rm -rf -- "$old_release"
      fi
      ;;
  esac
done

echo "Deployment $VERSION passed the local health check."
