// Galería de trabajos realizados
// Para agregar imágenes: copiá un bloque { url, alt, category } y pegalo en el array
// Las URLs deben ser de Cloudinary (https://res.cloudinary.com/dzykkbjhs/...)

export interface GalleryItem {
  url: string;
  alt: string;
  category?: string;
}

export const galleryItems: GalleryItem[] = [
  {
    url: 'https://res.cloudinary.com/dzykkbjhs/image/upload/v1779925105/fibrarte/zyaaijokrt2udj3gpglm.png',
    alt: 'Imán personalizado con nombre calado',
    category: 'Imanes',
  },
  // Agregá más imágenes acá siguiendo el mismo formato:
  // {
  //   url: 'https://res.cloudinary.com/dzykkbjhs/image/upload/v.../fibrarte/nombre-archivo.jpg',
  //   alt: 'Descripción del producto',
  //   category: 'Categoria',
  // },
];
