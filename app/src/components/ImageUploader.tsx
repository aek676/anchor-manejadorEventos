import { uploadImage, UploadImageResult } from "@/utils/uploadImage";
import React, { useState } from "react";

export default function ImageUploader() {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<UploadImageResult | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        setUploading(true);

        try {
            const uploadResult = await uploadImage(file);
            setResult(uploadResult);
            console.log("File uploaded successfully:", uploadResult);

        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <p>Uploading...</p>}
            {result && (
                <div>
                    <p>Upload successfully</p>
                    <p>Uri: {result.uri}</p>

                </div>
            )}
        </div>
    );
};
