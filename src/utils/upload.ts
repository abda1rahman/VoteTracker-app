import cloudinary from "cloudinary";
import log from "./logger";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.COUND_API_SECRET,
});

export async function uploadExcelToCloudinary(
  filePath: string,
  fileName: string
) {
  try {
    // Upload the file to Cloudinary
    const result = await cloudinary.v2.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "vote-application",
      public_id: fileName, // Set the custom name for the file
    });

    return result.url;
  } catch (error: any) {
    log.error("Error in Utils => uploadExcelToCloudinary: ", error.message);
    throw new Error(error);
  }
}
