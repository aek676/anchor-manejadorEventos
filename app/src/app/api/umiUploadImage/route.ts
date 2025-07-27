import { createGenericFile } from "@metaplex-foundation/umi";
import umiWithCurrentWalletAdapter from "@/utils/umiWithCurrentWalletAdapter";
import { createIrysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return new Response("No file provided", { status: 400 });
        }

        const umi = umiWithCurrentWalletAdapter();

        const fileUmi = createGenericFile(new Uint8Array(await file.arrayBuffer()), file.name, {
            contentType: file.type,
        });

        const uploader = createIrysUploader(umi, { payer: umi.payer });

        let [uri] = await uploader.upload([fileUmi]);
        uri = uri.replace("https://devnet.irys.xyz/", "").replace("https://gateway.irys.xyz/", "");

        return NextResponse.json({ uri }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return new Response("Upload failed", { status: 500 });
    }
};