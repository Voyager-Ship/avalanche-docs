import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }

  const [contentType, ...restPath] = slug;

  if (!['docs', 'academy', 'blog', 'integrations'].includes(contentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'content', contentType, ...restPath) + '.mdx';

  //ensure the resolved path is within the content directory
  const contentDir = path.join(process.cwd(), 'content');
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(contentDir)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const content = await fs.readFile(resolvedPath, 'utf-8');

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    const indexPath = path.join(process.cwd(), 'content', contentType, ...restPath, 'index.mdx');
    const resolvedIndexPath = path.resolve(indexPath);

    if (resolvedIndexPath.startsWith(contentDir)) {
      try {
        const content = await fs.readFile(resolvedIndexPath, 'utf-8');

        return new NextResponse(content, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        });
      } catch {
        // 404 fallback
      }
    }

    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
