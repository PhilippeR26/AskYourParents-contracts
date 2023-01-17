#restart devnet :
#curl -X POST http://127.0.0.1:5050/restart -H "Content-Type:application/json"

# for all addresses of predeployed account of devnet : 
#curl -X GET http://127.0.0.1:5050/predeployed_accounts -H "Content-Type:application/json"

# provide ETH to a wallet address (here for the ArgentX devnet Chrome) :
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x04b497639c3348AbF6E5761094c1C8a28616A273598e38Fd5ab41C3d4277c295","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
