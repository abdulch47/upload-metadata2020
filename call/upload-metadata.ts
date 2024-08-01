import { PublicKey, Keypair, Connection, clusterApiUrl, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { Metaplex, UploadMetadataInput, bundlrStorage, keypairIdentity, toPublicKey } from "@metaplex-foundation/js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";


require("dotenv").config();
import { DataV2, createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const secretKey: any = process.env.USER_WALLET;
const userWallet = Keypair.fromSecretKey(bs58.decode(secretKey));
const getNetworkConfig = (network: string) => {
    return {
        cluster: clusterApiUrl("mainnet-beta"),
        address: "https://node1.bundlr.network",
        providerUrl: "https://api.mainnet-beta.solana.com",
    };

};

const getMetaplexInstance = (
    network: any,
    connection: Connection,
    wallet: Keypair
) => {
    return Metaplex.make(connection)
        .use(keypairIdentity(wallet))
        .use(
            bundlrStorage({
                address: network.address,
                providerUrl: network.providerUrl,
                timeout: 60000,
            })
        );
};
(async () => {
    const MINT_ADDRESS = "CMxBZRcvFGDJL4KkURB4Wgj76LXyDB4eHXGLJvwjHXV1"; //token address
    const network = getNetworkConfig("mainnet-beta");
    const connection = new Connection(network.cluster);
    const metaplex = getMetaplexInstance(network, connection, userWallet);
    console.log(`Updating Metadata of Token: ${MINT_ADDRESS}`);

    const tokenMetadata: UploadMetadataInput = {
        name: "My Token",
        symbol: "MT",
        description: "This is description.",
        image: "https://bafybeihatkeztnauxmmbv2kmalgtpz3cosqxko4umejevuynt35jptr5oq.ipfs.nftstorage.link/android-chrome-512x512.png",
    }

    const mainTokenMetadata = {
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        description: tokenMetadata.description,
        uri: tokenMetadata.image,
        sellerFeeBasisPoints: 1000,
        creators: [
            { address: userWallet.publicKey, share: 100, verified: true },
        ],
        authority: userWallet,
        collection: null,
        uses: null
    } as DataV2;

    const uploadMetadata = async (tokenMetadata: UploadMetadataInput): Promise<string> => {
        const { uri } = await metaplex.nfts().uploadMetadata(tokenMetadata);
        return uri;

    }
    let metadataUri = await uploadMetadata(tokenMetadata);
    console.log("metadataUri: ", metadataUri)
    mainTokenMetadata.uri = metadataUri;
    const metadataPDA = await metaplex.nfts().pdas().metadata({ mint: new PublicKey(MINT_ADDRESS) });
    console.log("metadataPDA: ", metadataPDA)
    const txInstructions: TransactionInstruction[] = [];

    txInstructions.push(
        createCreateMetadataAccountV3Instruction({
            metadata: metadataPDA,
            mint: new PublicKey(MINT_ADDRESS),
            mintAuthority: userWallet.publicKey,
            payer: userWallet.publicKey,
            updateAuthority: userWallet.publicKey,
        }, {
            createMetadataAccountArgsV3: {
                data: mainTokenMetadata,
                isMutable: true,
                collectionDetails: null
            }
        })
    );
    const latestBlockhash = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
        payerKey: userWallet.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: txInstructions
    }).compileToV0Message();
    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([userWallet]);
    console.log("trx: ", transaction)


    const conn = new Connection(clusterApiUrl('mainnet-beta'));

    let { lastValidBlockHeight, blockhash } = await conn.getLatestBlockhash('finalized');
    const transactionId = await conn.sendTransaction(transaction);
    await conn.confirmTransaction({
        signature: transactionId,
        lastValidBlockHeight,
        blockhash
    })
    console.log(`transaction Hash`, transactionId);
    // upload new metadata

})();
