import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'health-card',
    resource_type: 'image',
    format: undefined, // keep original
    public_id: undefined,
  }),
});

const parser = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg','image/png','image/jpg','image/gif','image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Invalid image type'), ok);
  }
});

// Optional: normalize file url
parser._handleFile = ((orig) => (req, file, cb) => {
  orig.call(parser, req, file, (err, info) => {
    if (err) return cb(err);
    if (info && !info.path) {
      info.path = info.secure_url || info.url || "";
    }
    cb(null, info);
  });
})(parser._handleFile);

export default parser;
