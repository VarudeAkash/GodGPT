import Head from 'next/head';
import { useRouter } from 'next/router';
import { BLOG_POSTS } from '../../src/data/blogs.js';

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!slug) return null;

  if (!post) {
    return (
      <>
        <Head><title>Post Not Found | Astravedam</title></Head>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'white' }}>
          <h1>Post not found</h1>
          <button onClick={() => router.push('/blog')} style={{ marginTop: '20px', padding: '10px 24px', background: '#FF6B35', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
            Back to Blog
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} | Astravedam</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://astravedam.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://astravedam.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://astravedam.com/logo.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt,
          "author": { "@type": "Organization", "name": "Astravedam" },
          "publisher": { "@type": "Organization", "name": "Astravedam", "url": "https://astravedam.com" },
          "url": `https://astravedam.com/blog/${post.slug}`,
          "datePublished": post.date,
          "articleSection": post.category
        })}} />
      </Head>

      <div className="blog-page">
        <div className="blog-post-page">
          <button onClick={() => router.push('/blog')} className="blog-back-btn">← Back to Blog</button>

          <div className="blog-post-header">
            <div className="blog-post-meta">
              <span className="blog-category">{post.category}</span>
              <span className="blog-dot">·</span>
              <span className="blog-read-time">{post.readTime}</span>
              <span className="blog-dot">·</span>
              <span className="blog-date">{post.date}</span>
            </div>
            <h1 className="blog-post-title">{post.title}</h1>
            <p className="blog-post-excerpt">{post.excerpt}</p>
          </div>

          <div className="blog-post-content">
            {post.sections.map((section, i) => (
              <div key={i} className="blog-section">
                <h2>{section.heading}</h2>
                {section.content.split('\n\n').map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '48px', padding: '24px', background: 'rgba(255,107,53,0.1)', borderRadius: '12px', border: '1px solid rgba(255,107,53,0.2)' }}>
            <p style={{ margin: 0, color: '#ccc', fontSize: '15px' }}>
              Want a personalized reading based on your birth chart?{' '}
              <button onClick={() => router.push('/kundali')} style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', padding: 0 }}>
                Get your Kundali reading →
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
