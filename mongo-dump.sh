#!/usr/bin/env bash
set -e

NOW=`date +%Y%m%d`

cd backup
/usr/bin/mongodump --db oxygen --out dump-${NOW}
