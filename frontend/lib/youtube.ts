/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Handle youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }

    // Handle youtube.com formats
    if (urlObj.hostname.includes('youtube.com')) {
      // Regular watch?v= format
      const vParam = urlObj.searchParams.get('v');
      if (vParam) return vParam;

      // Shorts format
      if (urlObj.pathname.startsWith('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1];
      }

      // Embed format
      if (urlObj.pathname.startsWith('/embed/')) {
        return urlObj.pathname.split('/embed/')[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch YouTube video metadata using oEmbed API
 * Returns title and publish date
 */
export async function fetchYouTubeMetadata(url: string): Promise<{
  title: string;
  publishDate: string | null;
} | null> {
  try {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      console.error('Invalid YouTube URL:', url);
      return null;
    }

    // Use YouTube oEmbed API (no API key required)
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const response = await fetch(oEmbedUrl);
    if (!response.ok) {
      console.error('Failed to fetch YouTube metadata:', response.statusText);
      return null;
    }

    const data = await response.json();

    // oEmbed doesn't provide publish date, so we'll need to parse it from the page
    // For now, let's try to get it from the YouTube page HTML
    const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await pageResponse.text();

    // Extract publish date from meta tags
    let publishDate: string | null = null;
    const dateMatch = html.match(/"uploadDate":"([^"]+)"/);
    if (dateMatch) {
      publishDate = dateMatch[1].split('T')[0]; // Extract just the date part
    }

    return {
      title: data.title || 'Untitled',
      publishDate,
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return null;
  }
}

/**
 * Batch fetch YouTube metadata for multiple URLs
 */
export async function fetchYouTubeMetadataBatch(urls: string[]): Promise<Map<string, {
  title: string;
  publishDate: string | null;
}>> {
  const results = new Map();

  // Fetch in parallel with a reasonable limit to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(url =>
      fetchYouTubeMetadata(url).then(data => ({ url, data }))
    );

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ url, data }) => {
      if (data) {
        results.set(url, data);
      }
    });

    // Small delay between batches to be respectful
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
