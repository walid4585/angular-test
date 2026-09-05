import express from 'express';
import { getProducts, addProduct, updateProduct, deleteProduct , archiveProduct  } from '../controllers/productes.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();

      const safeExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

      const safeExt = safeExts.includes(ext) ? ext : '';

      const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = `${base || 'file'}-${unique}${safeExt}`;

      cb(null, fileName);
    },
  }),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image uploads are allowed'));
    }
  },
});



router.get('/', getProducts);
router.post('/', imageUpload.single('image'), addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/archive', archiveProduct);

export default router;
