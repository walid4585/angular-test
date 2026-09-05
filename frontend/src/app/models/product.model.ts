export type ProductSource = 'cloud' | 'local';

export interface ProductApiResponse {
  id?: string | number;
  _id?: string | number;
  title?: string;
  description?: string;
  imageUrl?: string | null;
  active?: boolean | number | string | null;
  price?: number | string | null;
  stock?: number | string | null;
  sizes?: unknown;
}

export interface ProductRecord {
  id: string;
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  active: boolean;
  price: number;
  stock: number;
  sizes: string[];
}

export interface ProductUpdatePayload {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  sizes: string[];
  active: boolean;
}

const toText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return value == null ? '' : String(value);
};

const toId = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '';
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true' || normalized === '1') {
      return true;
    }

    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }

  return true;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseSizes = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((size): size is string => typeof size === 'string')
      .map((size) => size.trim())
      .filter((size) => size.length > 0);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();

  if (
    !trimmed ||
    trimmed === '[object Object]' ||
    trimmed === 'null' ||
    trimmed === 'undefined'
  ) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parseSizes(parsed);
    }

    if (typeof parsed === 'string') {
      return parseSizes(parsed);
    }
  } catch {
    // Fall through to comma-separated parsing.
  }

  return trimmed
    .split(',')
    .map((size) => size.trim())
    .filter((size) => size.length > 0);
};

export function normalizeProduct(product: ProductApiResponse): ProductRecord {
  return {
    id: toId(product.id ?? product._id),
    _id: toId(product._id) || undefined,
    title: toText(product.title).trim(),
    description: toText(product.description).trim(),
    imageUrl: toText(product.imageUrl).trim(),
    active: toBoolean(product.active),
    price: toNumber(product.price),
    stock: toNumber(product.stock),
    sizes: parseSizes(product.sizes),
  };
}
