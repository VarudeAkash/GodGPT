import { useState, useEffect } from 'react';
import { BLOG_POSTS } from '../data/blogs.js';

export function BlogPost({ slug, onBack }) {
  const post = BLOG_POSTS.find(p => p.slug === slug);

  useEffect(() => {
    if (post) document.title = `${post.title} | Astravedam`;
    window.scrollTo(0, 0);
  }, [post]);

  if (!post) return (
    <div className="blog-not-found">
      <p>Post not found.</p>
      <button onClick={onBack} className="blog-back-btn">Back to Blog</button>
    </div>
  );

  return (
    <div className="blog-post-page">
      <button onClick={onBack} className="blog-back-btn">Back to Blog</button>

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
    </div>
  );
}

function BlogPage({ navigateTo }) {
  const [activePost, setActivePost] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    document.title = "Blog — Vedic Wisdom & Astrology | Astravedam";
  }, []);

  const categories = ['All', ...new Set(BLOG_POSTS.map(p => p.category))];
  const filtered = filter === 'All' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === filter);

  if (activePost) {
    return (
      <div className="blog-page">
        <BlogPost slug={activePost} onBack={() => setActivePost(null)} />
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <h1>Vedic Wisdom</h1>
        <p>Deep dives into Vedic astrology, Hindu philosophy, and the science of sacred living</p>
      </div>

      <div className="blog-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="blog-grid">
        {filtered.map(post => (
          <article key={post.slug} className="blog-card" onClick={() => setActivePost(post.slug)}>
            <div className="blog-card-meta">
              <span className="blog-category">{post.category}</span>
              <span className="blog-read-time">{post.readTime}</span>
            </div>
            <h2 className="blog-card-title">{post.title}</h2>
            <p className="blog-card-excerpt">{post.excerpt}</p>
            <div className="blog-card-footer">
              <span className="blog-date">{post.date}</span>
              <span className="blog-read-more">Read More</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default BlogPage;
