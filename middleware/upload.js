const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const createUploadDirs = () => {
  const dirs = [
    uploadsDir,
    path.join(uploadsDir, 'images'),
    path.join(uploadsDir, 'videos'),
    path.join(uploadsDir, 'documents'),
    path.join(uploadsDir, 'temp')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    // Determine subfolder based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadsDir, 'images');
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(uploadsDir, 'videos');
    } else {
      uploadPath = path.join(uploadsDir, 'documents');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + crypto.randomUUID();
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES ? 
      process.env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim()) :
      [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  } catch (error) {
    cb(error, false);
  }
};

// Size limits based on subscription
const getSizeLimit = (user) => {
  if (!user) return 5 * 1024 * 1024; // 5MB for unauthenticated users
  
  const limits = {
    free: 5 * 1024 * 1024,      // 5MB
    basic: 25 * 1024 * 1024,    // 25MB
    premium: 100 * 1024 * 1024, // 100MB
    enterprise: 500 * 1024 * 1024 // 500MB
  };
  
  return limits[user.subscription?.plan] || limits.free;
};

// Create multer upload middleware
const createUploadMiddleware = (fieldName = 'file', maxFiles = 1) => {
  return (req, res, next) => {
    const sizeLimit = getSizeLimit(req.user);
    
    const upload = multer({
      storage: storage,
      limits: {
        fileSize: sizeLimit,
        files: maxFiles
      },
      fileFilter: fileFilter
    });
    
    const uploadHandler = maxFiles === 1 ? 
      upload.single(fieldName) : 
      upload.array(fieldName, maxFiles);
    
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                success: false,
                message: `File too large. Maximum size allowed: ${Math.round(sizeLimit / (1024 * 1024))}MB`,
                maxSize: sizeLimit,
                userPlan: req.user?.subscription?.plan || 'free'
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                success: false,
                message: `Too many files. Maximum allowed: ${maxFiles}`,
                maxFiles: maxFiles
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                success: false,
                message: `Unexpected field name. Expected: ${fieldName}`
              });
            default:
              return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
              });
          }
        } else if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        } else {
          console.error('Upload error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload file'
          });
        }
      }
      
      next();
    });
  };
};

// Middleware to validate uploaded files
const validateUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  const files = req.files || [req.file];
  
  // Add file URLs to request
  files.forEach(file => {
    if (file) {
      file.url = `/uploads/${path.relative(uploadsDir, file.path).replace(/\\/g, '/')}`;
    }
  });
  
  next();
};

// Middleware to clean up uploaded files on error
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If response is an error and files were uploaded, clean them up
    if (res.statusCode >= 400) {
      const files = req.files || (req.file ? [req.file] : []);
      
      files.forEach(file => {
        if (file && file.path && fs.existsSync(file.path)) {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Failed to cleanup file:', file.path, err);
          });
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Utility function to delete file
const deleteFile = (filePath) => {
  return new Promise((resolve) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Failed to delete file:', filePath, err);
      }
      resolve();
    });
  });
};

// Utility function to get file stats
const getFileStats = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
};

// Middleware for image processing (requires sharp - optional)
const processImage = async (req, res, next) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return next();
    }
    
    // This would require installing sharp
    // const sharp = require('sharp');
    // 
    // const { buffer } = await sharp(req.file.path)
    //   .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    //   .jpeg({ quality: 85 })
    //   .toBuffer();
    //
    // fs.writeFileSync(req.file.path, buffer);
    
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(); // Continue even if processing fails
  }
};

module.exports = {
  createUploadMiddleware,
  validateUpload,
  cleanupOnError,
  processImage,
  deleteFile,
  getFileStats,
  getSizeLimit
};
