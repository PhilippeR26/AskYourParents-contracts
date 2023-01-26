#restart devnet :
#curl -X POST http://127.0.0.1:5050/restart -H "Content-Type:application/json"

# for all addresses of predeployed account of devnet : 
#curl -X GET http://127.0.0.1:5050/predeployed_accounts -H "Content-Type:application/json"

# provide ETH to a wallet address (here for the ArgentX devnet Chrome) :
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x04b497639c3348AbF6E5761094c1C8a28616A273598e38Fd5ab41C3d4277c295","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"

#argentX-Brave-devnet-account 1
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x04b497639c3348AbF6E5761094c1C8a28616A273598e38Fd5ab41C3d4277c295","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"

#argentX-Brave-devnet-account 2
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x0569c3e6197Fb1760E436AcFf9ac32Adfc1168408A9961240A2ca69Ae9712cEb","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"

#argentX-Brave-devnet-account 3
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x02E3Eb76e5C4EfD86d83DeF28a5BE2c55A933bC0CF45f5854B02484bdaD9D629","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"

#Braavos-Brave-devnet-account 1
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x00f92678a891046ae0789b9eb8dafde2669a6eb1bca493fb7d9b2bdd54171c18","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"

#Braavos-Brave-devnet-account 1
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x02a4bd957bd8def46287b5dbb9f74c4e5d18745dbbe29da406dbd940edaffc3c","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"





