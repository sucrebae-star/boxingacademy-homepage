import React from 'react';
import manifest from './photo-manifest.json';

export function ResponsivePhoto({ name, alt, className = '', priority = false, ...props }) {
  const photo = manifest.scenes[name];
  if (!photo) throw new Error(`Unknown renewal photo: ${name}`);
  return <picture className={`renewal-photo ${className}`} data-photo-scene={name}>
    <source media="(max-width: 700px)" srcSet={photo.mobile.src} width={photo.mobile.width} height={photo.mobile.height} />
    <img src={photo.web.src} width={photo.web.width} height={photo.web.height} alt={alt}
      loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined}
      decoding="async" {...props} />
  </picture>;
}

export function CurriculumPhoto({ part, loading }) {
  if (part.photoScene) return <ResponsivePhoto name={part.photoScene} alt={part.alt} />;
  return <img src={part.image} width="1672" height="941" loading={loading} decoding="async"
    alt={part.alt} />;
}
