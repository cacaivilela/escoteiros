#!/bin/sh
# Roda os testes do jogo sem navegador (precisa do gjs, o JavaScript do GNOME: sudo apt install gjs).
#   ./testes/roda.sh            → "capítulos 1–4 OK" ou a lista do que quebrou (sai com código 1)
#   ./testes/roda.sh --sabota   → quebra os dados de propósito e mostra que os testes acusam
cd "$(dirname "$0")/.." || exit 1
if [ "$1" = "--sabota" ]; then
  r=0
  for t in cap1 capitulos; do
    if QUEBRA=1 gjs testes/$t.test.js >/dev/null 2>&1; then echo "✘ testes/$t.test.js NÃO acusou a sabotagem"; r=1; else echo "✔ sabotagem acusada em testes/$t.test.js (é isso que a gente quer)"; fi
  done
  exit $r
fi
ini=$(date +%s)
gjs testes/cap1.test.js 2>/dev/null || exit 1
echo
gjs testes/capitulos.test.js 2>/dev/null || exit 1
echo
gjs testes/fumaca.test.js 2>/dev/null || exit 1
echo
echo "capítulos 1–4 OK ($(( $(date +%s) - ini ))s)"
