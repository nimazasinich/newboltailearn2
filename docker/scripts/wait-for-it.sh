#!/usr/bin/env bash
# wait-for-it.sh - Wait for a service to be ready before starting

set -e

TIMEOUT=60
QUIET=0
HOST=""
PORT=""

echoerr() {
  if [[ $QUIET -ne 1 ]]; then echo "$@" 1>&2; fi
}

usage() {
  exitcode="$1"
  cat << USAGE >&2
Usage:
  $0 host:port [-t timeout] [-- command args]
  $0 [-h host] [-p port] [-t timeout] [-- command args]
  -h HOST | --host=HOST       Host or IP under test
  -p PORT | --port=PORT       TCP port under test
  -t TIMEOUT | --timeout=TIMEOUT
                              Timeout in seconds, zero for no timeout
  -q | --quiet                Don't output any status messages
  -- COMMAND ARGS             Execute command with args after the test finishes
USAGE
  exit "$exitcode"
}

wait_for() {
  if [[ $TIMEOUT -gt 0 ]]; then
    echoerr "$0: waiting $TIMEOUT seconds for $HOST:$PORT"
  else
    echoerr "$0: waiting for $HOST:$PORT without a timeout"
  fi
  
  start_ts=$(date +%s)
  
  while :
  do
    if [[ $TIMEOUT -gt 0 ]]; then
      now_ts=$(date +%s)
      elapsed=$((now_ts - start_ts))
      if [[ $elapsed -ge $TIMEOUT ]]; then
        echoerr "$0: timeout occurred after waiting $TIMEOUT seconds for $HOST:$PORT"
        return 1
      fi
    fi
    
    nc -z "$HOST" "$PORT" >/dev/null 2>&1
    result=$?
    
    if [[ $result -eq 0 ]]; then
      if [[ $TIMEOUT -gt 0 ]]; then
        end_ts=$(date +%s)
        echoerr "$0: $HOST:$PORT is available after $((end_ts - start_ts)) seconds"
      else
        echoerr "$0: $HOST:$PORT is available"
      fi
      break
    fi
    
    sleep 1
  done
  
  return 0
}

while [[ $# -gt 0 ]]
do
  case "$1" in
    *:* )
      hostport=(${1//:/ })
      HOST=${hostport[0]}
      PORT=${hostport[1]}
      shift 1
      ;;
    -h)
      HOST="$2"
      shift 2
      ;;
    --host=*)
      HOST="${1#*=}"
      shift 1
      ;;
    -p)
      PORT="$2"
      shift 2
      ;;
    --port=*)
      PORT="${1#*=}"
      shift 1
      ;;
    -t)
      TIMEOUT="$2"
      shift 2
      ;;
    --timeout=*)
      TIMEOUT="${1#*=}"
      shift 1
      ;;
    -q | --quiet)
      QUIET=1
      shift 1
      ;;
    --)
      shift
      break
      ;;
    --help)
      usage 0
      ;;
    *)
      echoerr "Unknown argument: $1"
      usage 1
      ;;
  esac
done

# If no host/port specified, just execute the command
if [[ "$HOST" == "" ]] || [[ "$PORT" == "" ]]; then
  if [[ $# -gt 0 ]]; then
    exec "$@"
  else
    exit 0
  fi
fi

# Wait for the service
wait_for
RESULT=$?

# Execute command if provided
if [[ $# -gt 0 ]]; then
  exec "$@"
fi

exit $RESULT