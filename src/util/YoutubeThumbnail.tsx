export const getYoutubeEmbedUrl = (url: string): string => {
  if (!url) return "";

  // Already an embed URL
  if (url.includes("/embed/")) {
    return url;
  }

  // Extract video ID from various formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  return url;
};

export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
};

export const isValidYoutubeUrl = (url: string): boolean => {
  if (!url) return false;

  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
  return youtubeRegex.test(url);
};

export const getYoutubeThumbnail = (
  url: string,
  quality: "default" | "hq" | "mq" | "sd" | "maxres" = "hq"
): string | null => {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;

  const qualityMap = {
    default: "default",
    hq: "hqdefault",
    mq: "mqdefault",
    sd: "sddefault",
    maxres: "maxresdefault",
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};
