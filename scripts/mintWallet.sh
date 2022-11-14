#restart devnet :
#curl -X POST http://127.0.0.1:5050/restart -H "Content-Type:application/json"

# for all addresses of predeployed account of devnet : 
#curl -X GET http://127.0.0.1:5050/predeployed_accounts -H "Content-Type:application/json"

# provide ETH to a wallet address (here for the devnet ChildrenAccount) :
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x5d394beb37793857054cb5837613291029b1f423aae91e64833c3d6d4b78c53","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
