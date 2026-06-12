#!/bin/bash
cd "/Users/user/Documents/网页设计"
echo "==  WX 列表页地图 Demo  =="
echo "  本机: http://localhost:4173/"
echo "  局域网: http://$(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1):4173/"
echo "  Ctrl+C 停止"
echo ""
python3 -m http.server 4173 --bind 0.0.0.0
