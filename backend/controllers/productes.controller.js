import { allAsync, runAsync, withDbWriteLock } from '../module/database.js';

const normalizeSizesInput = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((size) => typeof size === 'string')
      .map((size) => size.trim())
      .filter((size) => size.length > 0);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return normalizeSizesInput(parsed);
    }

    if (typeof parsed === 'string') {
      return normalizeSizesInput(parsed);
    }
  } catch {
    // Fall through to comma-separated parsing.
  }

  return trimmed
    .split(',')
    .map((size) => size.trim())
    .filter((size) => size.length > 0);
};

const toTrimmedString = (value) =>
  typeof value === 'string' ? value.trim() : String(value ?? '').trim();

const toNumber = (value) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : NaN;
};

const toBooleanFlag = (value) => {
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return 1;
  }

  if (value === false || value === 0 || value === '0' || value === 'false') {
    return 0;
  }

  return 0;
};

export const getProducts = async (req, res) => {
  try {
   const rows = await allAsync(
  'SELECT * FROM products WHERE deleted = 0'
);

    res.json(
      rows.map((product) => ({
        ...product,
        sizes: normalizeSizesInput(product.sizes),
      }))
    );
  } catch (error) {
    console.error('Failed to retrieve products:', error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
};

export const addProduct = async (req, res) => {
  try {
    const title = toTrimmedString(req.body?.title);
    const description = toTrimmedString(req.body?.description);
    const uploadedFile = req.file;
    const uploadedImageUrl = uploadedFile?.filename
      ? `/uploads/${uploadedFile.filename}`
      : '';
    const imageUrl =
      uploadedImageUrl || toTrimmedString(req.body?.imageUrl);
    const price = toNumber(req.body?.price);
    const stock = toNumber(req.body?.stock ?? 0);
    const sizes = normalizeSizesInput(req.body?.sizes);

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: 'price must be a number greater than or equal to 0',
      });
    }

    if (!Number.isFinite(stock) || stock < 0) {
      return res.status(400).json({
        message: 'stock must be a number greater than or equal to 0',
      });
    }

    await withDbWriteLock(async () => {
      const result = await runAsync(
        `
          INSERT INTO products (
            title,
            price,
            sizes,
            description,
            imageUrl,
            stock,
            active
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [title, price, JSON.stringify(sizes), description, imageUrl, stock, 1]
      );

      res.status(201).json({
        message: 'Product created',
        id: result.lastID,
      });
    });
  } catch (error) {
    console.error('Failed to add product:', error);
    res.status(500).json({
      message: 'Failed to add product',
    });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, sizes, description, imageUrl, stock, active } =
    req.body ?? {};

  const normalizedTitle = toTrimmedString(title);
  const normalizedDescription = toTrimmedString(description);
  const normalizedImageUrl = toTrimmedString(imageUrl);
  const normalizedPrice = toNumber(price);
  const normalizedStock = toNumber(stock);
  const normalizedSizes = JSON.stringify(normalizeSizesInput(sizes));
  const normalizedActive = toBooleanFlag(active);

  if (!normalizedTitle) {
    return res.status(400).json({ message: 'title is required' });
  }

  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({
      message: 'price must be a number greater than or equal to 0',
    });
  }

  if (!Number.isFinite(normalizedStock) || normalizedStock < 0) {
    return res.status(400).json({
      message: 'stock must be a number greater than or equal to 0',
    });
  }

  try {
    await withDbWriteLock(async () => {
      const result = await runAsync(
        `
          UPDATE products
          SET title = ?, price = ?, sizes = ?, description = ?, imageUrl = ?, stock = ?, active = ?
          WHERE id = ?
        `,
        [
          normalizedTitle,
          normalizedPrice,
          normalizedSizes,
          normalizedDescription,
          normalizedImageUrl,
          normalizedStock,
          normalizedActive,
          id,
        ]
      );

      if (result.changes === 0) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.json({ changes: result.changes });
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await withDbWriteLock(async () => {
      const result = await runAsync('DELETE FROM products WHERE id = ?', [id]);

      if (result.changes === 0) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.json({ changes: result.changes });
    });
  } catch (error) {
    const errorMessage = String(error?.message ?? '');

    if (
      error?.code === 'SQLITE_CONSTRAINT' ||
      /FOREIGN KEY constraint failed/i.test(errorMessage)
    ) {
      res.status(409).json({
        message: 'Cannot delete product because it is referenced by existing orders',
      });
      return;
    }

    console.error('Failed to delete product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

export const archiveProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await withDbWriteLock(async () => {
      const result = await runAsync(
        'UPDATE products SET deleted = 1 WHERE id = ?',
        [id]
      );

      if (result.changes === 0) {
        res.status(404).json({
          message: 'Product not found',
        });
        return;
      }

      res.json({
        message: 'Product archived successfully',
      });
    });
  } catch (error) {
    console.error('Failed to archive product:', error);

    res.status(500).json({
      message: 'Failed to archive product',
    });
  }
};
