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

function withMulter(req, res, next, imageFieldName) {
  upload
    .single(imageFieldName)(req, res, (err) => {
      if (err) {
        if (err.message === 'Unexpected field' || err.message.substring(0, 17) === 'Image file format') {
          const errors = [{
            field: imageFieldName,
            error: 'Unable to read image',
          }];
          return res.status(400).json({ errors });
        }
        return next(err);
      }
      if (!req.file) {
        return res.status(400).json({
          msg: `${imageFieldName} required`,
          param: imageFieldName,
          location: 'body',
        });
      }
      return next();
    });
}

export function uploadImage(req, res, next) {
  withMulter(req, res, next, 'image');
}

export function uploadPoster(req, res, next) {
  withMulter(req, res, next, 'poster');
}