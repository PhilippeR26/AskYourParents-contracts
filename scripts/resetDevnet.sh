# source src/scripts/resetDevnet.sh
curl -X POST http://127.0.0.1:5050/restart -H "Content-Type:application/json"
echo Devnet network reinitialized!
