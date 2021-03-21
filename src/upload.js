import cloudinary from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: '',
    allowed_formats: ['jpg', 'png', 'gif'],
  },
});

const upload = multer({ storage });

export { upload };