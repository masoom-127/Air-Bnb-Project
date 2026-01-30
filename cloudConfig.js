const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.Cloud_API_Key,
  api_secret: process.env.Cloud_API_Secret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wonderLust_dev',
    allowedFormats: ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'],  // supports promises as well
    
  },
});

module.exports={
    cloudinary,
    storage,
}