#restart devnet :
#curl -X POST http://127.0.0.1:5050/restart -H "Content-Type:application/json"

# for all addresses of predeployed account of devnet : 
#curl -X GET http://127.0.0.1:5050/predeployed_accounts -H "Content-Type:application/json"

# provide ETH to a wallet address (here for the devnet ChildrenAccount) :
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x24f25365711f5c1f96dd8abaf49188ede25f355cf8e030d0d2913a2ac8b3347","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
