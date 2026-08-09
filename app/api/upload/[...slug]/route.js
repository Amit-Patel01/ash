export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug || ['general'];
    const uploadType = slug[0] || 'general';

    const formData = await request.formData();
    const file = formData.get('file') || formData.get('screenshot') || formData.get('photo') || formData.get('image') || formData.get('broadcast-image') || formData.get('chat-image') || formData.get('asset');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No valid file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save into public/uploads/[uploadType]
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadType);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uploadType}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
