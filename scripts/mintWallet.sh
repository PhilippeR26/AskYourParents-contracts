#restart devnet :
#curl -X POST http://127.0.0.1:5050/restart -H "Content-Type:application/json"

# for all addresses of predeployed account of devnet : 
#curl -X GET http://127.0.0.1:5050/predeployed_accounts -H "Content-Type:application/json"

# provide ETH to a wallet address (here for my ArgentX Account6 ; change adress herunder) :
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x045f825D68f5253A546f3E20392cA7159a9B1CABb49EC4285098901a2714d5a4","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
