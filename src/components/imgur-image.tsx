'use client';

import Image, { type ImageProps } from 'next/image';

// Función para extraer el ID de Imgur de varias URL
const getImgurId = (url: string): string | null => {
  if (!url) return null;
  // Expresiones regulares para diferentes formatos de URL de Imgur
  const patterns = [
    /i\.imgur\.com\/([a-zA-Z0-9]+)\.\w+$/, // Enlace directo (i.imgur.com/xxxx.png)
    /imgur\.com\/([a-zA-Z0-9]{5,})(?:\.\w+)?$/,    // Enlace de imagen (imgur.com/xxxx)
    /imgur\.com\/gallery\/([a-zA-Z0-9]+)/,   // Enlace de galería (imgur.com/gallery/xxxx)
    /imgur\.com\/a\/([a-zA-Z0-9]+)/,         // Enlace de álbum (imgur.com/a/xxxx)
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    // match[1] contiene el ID de la imagen/álbum
    if (match && match[1]) {
      // Evitar que capture 'a' o 'gallery' como ID
      if ((url.includes('/a/') && match[1] === 'a') || (url.includes('/gallery/') && match[1] === 'gallery')) {
        continue;
      }
      return match[1];
    }
  }

  // Si no se encuentra un ID, devuelve null
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
          // Construir la URL directa a la imagen
          finalSrc = `https://i.imgur.com/${imgurId}.png`;
      }
      // Si parece una URL de Imgur pero no se puede procesar,
      // es mejor no mostrar una imagen rota. Dejamos que el onError lo maneje.
  }

  // Si después del procesamiento no hay una fuente válida, no renderizar nada para evitar errores.
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
      // Añadimos un onError para manejar casos donde la URL final aún no es válida o está rota.
      onError={(e) => {
          // Opcional: Podrías establecer una imagen de fallback aquí
          // Por ahora, simplemente ocultamos la imagen rota para no romper la UI.
          e.currentTarget.style.display = 'none';
          
          // Si quieres mostrar el contenedor de 'No Image' en caso de error, puedes hacerlo así:
          const parent = e.currentTarget.parentElement;
          if (parent) {
             const errorDiv = document.createElement('div');
             errorDiv.style.width = typeof props.width === 'number' ? `${props.width}px` : '100%';
             errorDiv.style.height = typeof props.height === 'number' ? `${props.height}px` : '100%';
             errorDiv.className = "bg-muted flex items-center justify-center text-xs text-muted-foreground";
             errorDiv.innerText = "Error";
             parent.appendChild(errorDiv);
          }
      }}
    />
  );
}
