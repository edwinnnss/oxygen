#!/usr/bin/env bash
set -e

node async_tasks/indoxx1
NOW=`date +%Y%m%d`

cd backup
mongodump --db oxygen --out dump-${NOW}
