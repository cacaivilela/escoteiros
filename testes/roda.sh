#!/bin/sh
# Roda os testes do jogo sem navegador (precisa do gjs, o JavaScript do GNOME: sudo apt install gjs).
#   ./testes/roda.sh            → "capítulo 1 OK" ou a lista do que quebrou (sai com código 1)
#   ./testes/roda.sh --sabota   → quebra os dados de propósito e mostra que o teste acusa
cd "$(dirname "$0")/.." || exit 1
if [ "$1" = "--sabota" ]; then
  if QUEBRA=1 gjs testes/cap1.test.js >/dev/null 2>&1; then echo "✘ o teste NÃO acusou a sabotagem"; exit 1; else echo "✔ sabotagem acusada (é isso que a gente quer)"; exit 0; fi
fi
ini=$(date +%s)
gjs testes/cap1.test.js 2>/dev/null || exit 1
echo
gjs testes/fumaca.test.js 2>/dev/null || exit 1
echo
echo "capítulo 1 OK ($(( $(date +%s) - ini ))s)"
