#!/usr/bin/env bash
# Sobe um Postgres temporário (Docker), aplica as migrations e roda os testes de permissão.
# Uso: npm run test:db
set -euo pipefail
cd "$(dirname "$0")/.."
NAME="sbg-test-db-$$"
docker run -d --rm --name "$NAME" -e POSTGRES_PASSWORD=test postgres:15-alpine >/dev/null
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT
until docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
sleep 1
run() { docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 -q "$@"; }
for f in supabase/tests/00_stubs.sql supabase/tests/01_vault_stub.sql supabase/migrations/*.sql; do
  run < "$f" 2>&1 | grep -v "NOTICE" || true
  [ "${PIPESTATUS[0]}" -eq 0 ] || { echo "Erro ao aplicar $f"; exit 1; }
done
for t in supabase/tests/1*.sql supabase/tests/2*.sql; do
  out=$(run < "$t" 2>&1) || { echo "$out" | sed -n 's/^NOTICE:  //p; /ERROR/p'; echo "Falhou: $t"; exit 1; }
  echo "$out" | sed -n 's/^NOTICE:  //p; /ERROR/p'
done
echo "Testes de permissão: tudo certo."
