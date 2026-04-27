import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

function configure() {
  const c = process.env.CLOUDINARY_CLOUD_NAME;
  const k = process.env.CLOUDINARY_API_KEY;
  const s = process.env.CLOUDINARY_API_SECRET;
  if (!c || !k || !s) {
    return null;
  }
  cloudinary.config({ cloud_name: c, api_key: k, api_secret: s });
  return true;
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "inventory_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!configure()) {
    return NextResponse.json(
      { error: "Image upload is not configured" },
      { status: 501 }
    );
  }

  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = process.env.CLOUDINARY_FOLDER ?? "dayli-energy";

  try {
    const url: string = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (err, result) => {
          if (err) reject(err);
          else if (result?.secure_url) resolve(result.secure_url);
          else reject(new Error("Upload failed"));
        }
      );
      stream.end(buffer);
    });
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
