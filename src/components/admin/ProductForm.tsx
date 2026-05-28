'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';
import {
  createProduct,
  updateProduct,
  addProductImage,
  removeProductImage,
  updateProductImages,
} from '@/app/actions/products';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'Máximo 200 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z
    .string()
    .min(1, 'El precio es requerido')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Debe ser un precio válido'),
  measures: z.string().optional(),
  whatsappMsg: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  active: z.boolean(),
  order: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductImage {
  id?: number;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  isNew?: boolean;
}

interface ProductData {
  id: number;
  name: string;
  description: string;
  price: string;
  measures: string | null;
  whatsappMsg: string | null;
  categoryId: number;
  active: boolean;
  order: number;
  images: ProductImage[];
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: ProductData;
  categories: Category[];
}

export default function ProductForm({ mode, product, categories }: ProductFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<ProductImage[]>(product?.images || []);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || '',
      measures: product?.measures || '',
      whatsappMsg: product?.whatsappMsg || '',
      categoryId: product?.categoryId?.toString() || '',
      active: product?.active !== undefined ? product.active : true,
      order: product?.order?.toString() || '0',
    },
  });

  const activeValue = watch('active');

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        categoryId: parseInt(data.categoryId),
        order: data.order ? parseInt(data.order) : 0,
        measures: data.measures || null,
        whatsappMsg: data.whatsappMsg || null,
        active: data.active,
      };

      let productId = product?.id;

      if (mode === 'create') {
        const result = await createProduct(payload);
        productId = result.id;
      } else if (productId) {
        await updateProduct(productId, payload);
      }

      if (productId) {
        const newImages = images.filter((img) => img.isNew);
        for (const img of newImages) {
          await addProductImage(productId, { url: img.url, alt: img.alt, isPrimary: img.isPrimary });
        }

        for (const imageId of deletedImageIds) {
          await removeProductImage(productId, imageId);
        }

        const existingImages = images.filter((img) => !img.isNew && img.id);
        if (existingImages.length > 0) {
          await updateProductImages(
            productId,
            existingImages.map((img, i) => ({ id: img.id!, isPrimary: img.isPrimary, order: i }))
          );
        }
      }

      toast.success(mode === 'create' ? 'Producto creado exitosamente' : 'Producto actualizado');
      router.push('/admin/productos');
      router.refresh();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-2xl border border-beige p-6 space-y-5">
        <h2 className="font-heading text-lg font-semibold text-brown-dark border-b border-beige pb-4">
          Información del Producto
        </h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-brown-dark mb-1.5">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Ej: Imán Personalizado"
            className="w-full px-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark placeholder-brown-light/40 transition-colors"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-brown-dark mb-1.5">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            {...register('categoryId')}
            className="w-full px-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark transition-colors"
          >
            <option value="">Seleccioná una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Price and Order */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              Precio (ARS) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('price')}
              type="number"
              step="0.01"
              min="0"
              placeholder="1700"
              className="w-full px-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark placeholder-brown-light/40 transition-colors"
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              Orden
            </label>
            <input
              {...register('order')}
              type="number"
              min="0"
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark placeholder-brown-light/40 transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-brown-dark mb-1.5">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Describí el producto con detalle..."
            className="w-full px-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark placeholder-brown-light/40 transition-colors resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Measures */}
        <div>
          <label className="block text-sm font-medium text-brown-dark mb-1.5">
            Medidas
          </label>
          <input
            {...register('measures')}
            type="text"
            placeholder="Ej: 7cm x 5cm"
            className="w-full px-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark placeholder-brown-light/40 transition-colors"
          />
        </div>

        {/* WhatsApp message */}
        <div>
          <label className="block text-sm font-medium text-brown-dark mb-1.5">
            Mensaje WhatsApp personalizado
          </label>
          <textarea
            {...register('whatsappMsg')}
            rows={2}
            placeholder="Hola! Me interesa el producto..."
            className="w-full px-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-brown-medium focus:ring-2 focus:ring-brown-light/20 text-brown-dark placeholder-brown-light/40 transition-colors resize-none"
          />
          <p className="text-xs text-brown-medium/60 mt-1">
            Si está vacío, se usará el mensaje genérico con el nombre del producto
          </p>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-brown-dark">Producto activo</p>
            <p className="text-xs text-brown-medium/60">Los productos inactivos no aparecen en el catálogo</p>
          </div>
          <button
            type="button"
            onClick={() => setValue('active', !activeValue)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              activeValue ? 'bg-brown-dark' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                activeValue ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-beige p-6">
        <h2 className="font-heading text-lg font-semibold text-brown-dark border-b border-beige pb-4 mb-5">
          Imágenes del Producto
        </h2>
        <ImageUpload
          images={images}
          onChange={setImages}
          onDelete={(id) => setDeletedImageIds((prev) => [...prev, id])}
        />
      </div>

      {/* Submit buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-brown-dark hover:bg-brown-medium text-cream py-3 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {mode === 'create' ? 'Creando...' : 'Guardando...'}
            </>
          ) : mode === 'create' ? (
            'Crear Producto'
          ) : (
            'Guardar Cambios'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/productos')}
          className="px-6 py-3 rounded-xl border border-beige text-brown-medium hover:bg-beige transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
