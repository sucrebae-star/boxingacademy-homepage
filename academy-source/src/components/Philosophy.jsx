import React from 'react';
import {philosophyPosts} from '../content/philosophy-posts.mjs';

const board = '#jeonju/philosophy';
const articleUrl = article => board + '/' + article.slug;

function PostDate({date}) {
  return <time className="philosophy-date" dateTime={date}>{date.replaceAll('-', '. ')}</time>;
}

function PostImage({image, assets, caption}) {
  return <figure>
    <img src={assets[image.src] || image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async"/>
    {caption && image.caption && <figcaption>{image.caption}</figcaption>}
  </figure>;
}

function PostBlock({block, assets}) {
  if (block.type === 'image') return <PostImage image={block} assets={assets} caption/>;
  if (block.type === 'links') return <p className="philosophy-place">{block.items.map((item, i) => <React.Fragment key={item.href}>{i > 0 && ' · '}<a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a></React.Fragment>)}</p>;
  if (block.type === 'heading') return <h2>{block.text}</h2>;
  if (block.type === 'place') return <p className="philosophy-place">
    <a href={block.href} target="_blank" rel="noopener noreferrer">{block.text} ↗</a>
    <br/>{block.address}
  </p>;
  return <p>{block.parts ? block.parts.map(({text, bold, italic}, index) => {
    const content = italic ? <em>{text}</em> : text;
    return bold ? <strong key={index}>{content}</strong> : <React.Fragment key={index}>{content}</React.Fragment>;
  }) : block.text}</p>;
}

export default function Philosophy({article, assets}) {
  const post = philosophyPosts.find(item => item.slug === article);
  const [featured, ...recent] = philosophyPosts;

  return <section id="jeonju-philosophy" className="shell section-pad philosophy">
    <p className="eyebrow">복싱사관학교 효천본관</p>
    {post ? <article className="philosophy-article">
      <a className="quiet philosophy-back" href={board}>← 지도 철학 목록</a>
      <h1>{post.title}</h1>
      <p className="philosophy-author">{post.author}</p>
      <PostDate date={post.date}/>
      <div className="philosophy-body">
        {post.blocks.map((block, index) => <PostBlock key={index} block={block} assets={assets}/>)}
      </div>
      {post.source && <a className="text-link" href={post.source} target="_blank" rel="noopener noreferrer">블로그 원문 보기 ↗</a>}
    </article> : <>
      <h1>지도 철학</h1>
      {article && <p role="status" className="quiet">요청한 글을 찾을 수 없습니다.</p>}
      {featured ? <>
        <article className="philosophy-feature">
          <div>
            <p className="eyebrow">대표 글</p>
            <h2>{featured.title}</h2>
            <p>{featured.summary}</p>
            <PostDate date={featured.date}/>
            <a className="button" href={articleUrl(featured)}>글 읽기 ↗</a>
          </div>
          {featured.cover && <PostImage image={featured.cover} assets={assets} caption/>}
        </article>
        {recent.length > 0 && <section className="philosophy-list" aria-labelledby="philosophy-list">
          <h2 id="philosophy-list">전체 글</h2>
          <div className="philosophy-grid">
            {recent.map(item => <article key={item.slug}>
              <h3><a href={articleUrl(item)}>{item.title}</a></h3>
              <p>{item.summary}</p>
              <PostDate date={item.date}/>
            </article>)}
          </div>
        </section>}
      </> : <p className="philosophy-empty">효천본관의 수업 방식과 지도 철학을 담은 글을 준비 중입니다.</p>}
    </>}
  </section>;
}
