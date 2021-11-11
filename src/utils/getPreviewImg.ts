import got from "got";
const metascraper = require("metascraper")([require("metascraper-image")()]);

export const getPreviewImg = async (
  link: string
): Promise<string | undefined> => {
  const imageRegex = /\.(jpeg|jpg|gif|png)$/;
  const youtubeRegex =
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

  let previewImg;
  if (link) {
    if (imageRegex.test(link)) {
      // link is an image
      previewImg = link;
    } else if (youtubeRegex.test(link)) {
      // link is from youtube
      const videoIdRegex = /youtube\.com.*(\?v=|\/embed\/)(.{11})/;
      const videoId = link.match(videoIdRegex)?.pop();
      previewImg = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    } else {
      // scrape meta data from page for thumbnail
      try {
        const { body: html, url } = await got(link, {
          timeout: 3000,
          retry: 0,
        });
        const metadata = await metascraper({ html, url });
        previewImg = metadata.image;
      } catch (err) {
        console.error(err);
        return undefined;
      }
    }
  }
  return previewImg;
};
