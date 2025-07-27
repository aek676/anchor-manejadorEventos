import { createGenericFile } from "@metaplex-foundation/umi";
import usewithcurrentWalletAdapter from "@/utils/umiWithCurrentWalletAdapter";
import { createIrysUploader } from "@metaplex-foundation/umi-uploader-irys";

export const URL_IRYS_DEVNET = "https://devnet.irys.xyz/";

export interface UploadImageResult {
    uri: string;
    fileName: string;
    fileSize: number;
    contentType: string | null;
}

export const uploadImage = async (file: File): Promise<UploadImageResult> => {
    try {
        const umi = usewithcurrentWalletAdapter();

        const fileBuffer = await file.arrayBuffer();
        const fileUmi = createGenericFile(new Uint8Array(fileBuffer), file.name, {
            contentType: file.type,
        });

        const uploader = createIrysUploader(umi, {
            payer: umi.payer,
            priceMultiplier: 2.0,
        });

        console.log(`Uploader: ${uploader}`);

        console.log(`FileUmi: ${fileUmi.fileName}`);

        let [uri] = await uploader.upload([fileUmi]);

        uri = uri
            .replace("https://devnet.irys.xyz/", "")
            .replace("https://gateway.irys.xyz/", "");

        return {
            uri,
            fileName: fileUmi.fileName,
            fileSize: file.size,
            contentType: fileUmi.contentType,
        };
    } catch (error) {
        console.error("Error al subir el archivo:", error);
        return {
            uri: "",
            fileName: "",
            fileSize: 0,
            contentType: null,
        };
    }
}