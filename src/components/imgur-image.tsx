'use client';

import Image, { type ImageProps } from 'next/image';

// Función para extraer el ID de Imgur de varias URL
const getImgurId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /imgur\.com\/([a-zA-Z0-9]+)(?:\.\w+)?$/,
    /i\.imgur\.com\/([a-zA-Z0-9]+)\.\w+$/,
    /imgur\.com\/a\/([a-zA-Z0-9]+)/,
    /imgur\.com\/gallery\/([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
        // Asegurarnos que no estamos capturando 'a' o 'gallery' como ID
        if (match[0].includes('/a/') || match[0].includes('/gallery/')) {
           if (match[1] === 'a' || match[1] === 'gallery') continue;
        }
        return match[1];
    }
  }
  return null;
};

interface ImgurImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  imgurUrl: string;
  alt: string;
}

export function ImgurImage({ imgurUrl, alt, ...props }: ImgurImageProps) {
  const imgurId = getImgurId(imgurUrl);

  if (!imgurId) {
    // Retornar un placeholder o un mensaje de error si la URL no es válida
    return (
        <div style={{ width: props.width, height: props.height }} className="bg-muted flex items-center justify-center text-xs text-muted-foreground">
            URL inválida
        </div>
    );
  }

  const directImageUrl = `https://i.imgur.com/${imgurId}.png`;

  return (
    <Image
      src={directImageUrl}
      alt={alt}
      {...props}
    />
  );
}
