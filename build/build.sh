#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function build () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"
  cd "$SELFPATH" || return $?

  local DL_DIR='orig-files'
  mkdir -p "$DL_DIR" || return $?

  local GH_USER='stephentetley'
  local GH_REPO='payasan'
  local GH_COMMIT='884474a336cc1b9b077c266d27347555de5ad1e7'
  local RAW_BASE="https://github.com/$GH_USER/$GH_REPO/raw/$GH_COMMIT/"
  local HS_FILES=(
    # can't parse this yet # Chord
    Diatonic+Interval
    Duration
    GeneralMidi:Drums
    GeneralMidi:Instruments
    Interval
    Key
    Pitch
    Scale
    )

  github_dl % %.txt LICENSE || return $?
  local ITEM=
  local BFN=
  local DIST=
  for ITEM in "${HS_FILES[@]}"; do
    BFN="$ITEM"
    BFN="${BFN//:/}"
    BFN="${BFN//\+/}"
    github_dl src/Payasan/Base/Names/% % "$BFN".hs || return $?
    DIST="$ITEM"
    DIST="${DIST##*:}"
    DIST="${DIST%%\+*}"
    DIST="${DIST,,}"
    conv_hs2json "$DL_DIR"/"$BFN".hs ../dist/"$DIST" || return $?
  done

  return 0
}


function github_dl () {
  local ORIG_PTN="$1"; shift
  local SAVE_PTN="$1"; shift
  local BFN="$1"; shift
  local DL_URL="$RAW_BASE${ORIG_PTN//%/$BFN}"
  local SAVE_FN="$DL_DIR/${SAVE_PTN//%/$BFN}"
  echo -n "$FUNCNAME: $SAVE_FN"
  if [ -s "$SAVE_FN" ]; then
    echo ': already in cache.'
  else
    echo " <- $DL_URL :"; echo
    local UAGENT='Mozilla/5.0 (actually, wget) Gecko/19700101 Firefox/0.0'
    wget --user-agent="$UAGENT" -O "$SAVE_FN.part" -c "$DL_URL" || return $?
    mv --verbose --no-target-directory -- "$SAVE_FN"{.part,} || return $?
    echo
  fi
  return 0
}


function conv_hs2json () {
  local SRC="$1"; shift
  local DIST="$1"; shift
  local JSON="$(nodejs -- extract.js "$SRC")"
  [ -n "$JSON" ] || return 3$(echo "E: no output from extractor" >&2)
  [ "${JSON:0:1}" == '{' ] || return 3$(
    echo "E: AMD wrapper currently supports non-array objects only." >&2)
  local UTF8BOM=$'\xEF\xBB\xBF'
  echo "${UTF8BOM}$JSON" >"$DIST".json || return $?
  <<<"${UTF8BOM}define($JSON);" tr '\n' '\r' | sed -re '
    s~(\r *"[^"]*":) +~\1~g
    s~\r\s*~~g
    s~\s*$~\n~' >"$DIST".amd.js || return $?
  return 0
}













[ "$1" == --lib ] && return 0; build "$@"; exit $?
