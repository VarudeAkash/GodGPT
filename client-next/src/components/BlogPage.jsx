import { useState } from 'react';
import { useRouter } from 'next/router';
import { BLOG_POSTS } from '../data/blogs.js';

function BlogPage({ navigateTo }) {
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(BLOG_POSTS.map(p => p.category))];
  const filtered = filter === 'All' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === filter);

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
          <article key={post.slug} className="blog-card" onClick={() => router.push(`/blog/${post.slug}`)}>
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
