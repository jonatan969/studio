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
  src: string;
  alt: string;
}

export function ImgurImage({ src, alt, ...props }: ImgurImageProps) {
  let finalSrc = src;

  // Solo procesar si es una URL de Imgur
  if (src && src.includes('imgur.com')) {
      const imgurId = getImgurId(src);
      if (imgurId) {
          finalSrc = `https://i.imgur.com/${imgurId}.png`;
      } else {
          // Si parece una URL de Imgur pero no se puede procesar,
          // es mejor no mostrar una imagen rota.
          // Opcional: retornar un placeholder. Por ahora, usamos el src original.
          finalSrc = src; 
      }
  }

  // Si finalSrc está vacío o no es una URL válida, Image dará un error.
  // Es mejor no renderizar nada si no hay una fuente válida.
  if (!finalSrc) {
       return (
        <div style={{ width: props.width, height: props.height }} className="bg-muted flex items-center justify-center text-xs text-muted-foreground">
            No Image
        </div>
    );
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      {...props}
      // Añadimos un onError para manejar casos donde la URL final aún no es válida
      onError={(e) => {
          // Opcional: Podrías establecer una imagen de fallback
          e.currentTarget.style.display = 'none'; // Ocultar la imagen rota
      }}
    />
  );
}
