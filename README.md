## for running the project
1. install node (18.17.1)
2. install typescript
3. run npm i
4. paste your wallet secretKey and set network in `.env` 
5. update data in `tokenInfo/mint.ts`
  like decimals, totalSupply, name, symbol, image, isMutable, newUpdateAuthority, verifySignerAsCreator
6. minted token address and keypair will save in `output/[token-name]` file

## note: First change your wallet secret key on env file
## mint new token
`ts-node call/mint.ts`

## update token metadata 
update token data in `splHelper/consts.ts`
like name, symbol, image, isMutable, newUpdateAuthority, verifySignerAsCreator
`ts-node call/update_metadata.ts`

## update token authority 
for update mint authority run `ts-node call/update_authority.ts`

## disable token mint authority 
for disable token mint authority  run `ts-node call/disable_mint_authority.ts`

## disable token metadata Immutabe 
for disable token metadata Immutabe  run `ts-node call/disable_metadata_mutable.ts`

## disable token freeze  authority
for disable token freeze  authority run `ts-node call/disable_freeze_authority.ts`


for more info check solana metaplex [The Nft model](https://github.com/metaplex-foundation/js?tab=readme-ov-file#the-nft-model)
