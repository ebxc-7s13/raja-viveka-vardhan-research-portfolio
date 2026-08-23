import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { sanitizeRichText } from '@/lib/validation';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const db = getDb();
  return db
    .prepare(
      `SELECT p.*, u.name as author_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.slug = ? AND p.published = 1`
    )
    .get(slug) as any;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: [post.author_name || 'Author'],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-slate-950">
      <article className="max-w-3xl mx-auto px-6 py-20">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-400 mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Research Notes
        </Link>

        {/* Post Header */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center text-sm text-slate-400">
            {post.author_name && (
              <span className="mr-4">by {post.author_name}</span>
            )}
            <time>
              {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        {/* Post Content */}
        <div
          className="prose-research"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
        />

        {/* Post Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-800">
          <Link
            href="/blog"
            className="text-emerald-400 hover:text-emerald-300 flex items-center"
          >
            ← All Research Notes
          </Link>
        </footer>
      </article>
    </main>
  );
}
