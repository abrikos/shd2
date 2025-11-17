#!/bin/bash
cd /home/abrikos/Documents/Qtech/
scp -r swc.qtech.ru:/home/abrikos/backup/swc.tar.gz .
tar -xvzf swc.tar.gz
mongorestore --drop