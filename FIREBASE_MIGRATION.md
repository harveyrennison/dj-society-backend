# Firebase Storage Migration Guide

## Overview
Your backend has been successfully migrated from local file storage to Google Firebase Storage. Images (like profile pictures) are now stored in Firebase Cloud Storage instead of your local computer's `storage/images` folder.

## What Changed

### Files Modified:
1. **[firebase-admin.ts](src/config/firebase-admin.ts)** - Added Firebase Storage bucket initialization
2. **[firebase-storage.service.ts](src/app/services/firebase-storage.service.ts)** - New service for Firebase Storage operations
3. **[images.model.ts](src/app/models/images.model.ts)** - Updated to use Firebase Storage instead of local filesystem
4. **[image.controller.ts](src/app/controllers/image.controller.ts)** - Updated to download images from Firebase
5. **[image.tools.ts](src/app/tools/image.tools.ts)** - Removed local file path dependencies

### Key Benefits:
- ✅ **Scalable** - No more running out of disk space
- ✅ **Reliable** - Firebase handles backups and redundancy
- ✅ **CDN** - Images are served from Google's CDN for faster loading
- ✅ **Secure** - Built-in security rules and access control
- ✅ **Portable** - Your app can run anywhere without worrying about file storage

## Setup Instructions

### 1. Enable Firebase Storage
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (the-dj-society)
3. Navigate to **Storage** in the left sidebar
4. Click **Get Started** if you haven't enabled Storage yet
5. Follow the setup wizard (choose production mode for default security rules)

### 2. Configure Storage Bucket (Optional)
If you want to specify a custom bucket name:
1. Create a `.env` file in your Backend folder (copy from `.env.example`)
2. Set `FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com`

If you don't set this, it will automatically use `<project_id>.appspot.com` from your Firebase service account.

### 3. Set Up Storage Security Rules
In the Firebase Console under Storage > Rules, update your rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures - publicly readable, authenticated users can upload their own
    match /profile-pictures/{imageId} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null;  // Only authenticated users can upload
      allow delete: if request.auth != null;  // Only authenticated users can delete
    }
    
    // Default - deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 4. Test the Migration
1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Test uploading a profile picture:
   ```bash
   # Replace with your actual endpoint and auth token
   curl -X POST http://localhost:3000/api/users/{userId}/profile-picture \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@/path/to/image.jpg"
   ```

3. Test retrieving a profile picture:
   ```bash
   curl http://localhost:3000/api/users/{userId}/profile-picture \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Data Migration (Optional)

If you have existing images in `storage/images/profile-picture/`, you can migrate them to Firebase:

### Option 1: Manual Upload via Firebase Console
1. Go to Firebase Console > Storage
2. Create a folder called `profile-pictures`
3. Upload existing images

### Option 2: Programmatic Migration Script
Create a migration script:

```typescript
// scripts/migrate-images.ts
import { admin } from '../src/config/firebase-admin';
import fs from 'fs';
import path from 'path';

const bucket = admin.storage().bucket();
const localImagesPath = './storage/images/profile-picture';

async function migrateImages() {
  const files = fs.readdirSync(localImagesPath);
  
  for (const filename of files) {
    const localPath = path.join(localImagesPath, filename);
    const remotePath = `profile-pictures/${filename}`;
    
    await bucket.upload(localPath, {
      destination: remotePath,
      metadata: {
        contentType: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
      },
    });
    
    // Make public
    await bucket.file(remotePath).makePublic();
    
    console.log(`Migrated: ${filename}`);
  }
}

migrateImages().then(() => console.log('Migration complete!'));
```

Run with: `npx tsx scripts/migrate-images.ts`

## How It Works Now

### Upload Flow:
1. User sends image via multipart form data
2. Multer middleware captures the buffer in memory
3. `handleProfileUpload` in [image.controller.ts](src/app/controllers/image.controller.ts#L47) processes the request
4. `addProfilePictureImage` uploads to Firebase Storage with a random filename
5. Filename is stored in your database
6. Old image (if exists) is deleted from Firebase

### Retrieval Flow:
1. User requests profile picture
2. `getImage` in [image.controller.ts](src/app/controllers/image.controller.ts#L10) fetches the filename from database
3. `downloadImage` retrieves the file from Firebase Storage
4. Image buffer is sent back to the client

### Delete Flow:
1. User requests to delete profile picture
2. `deleteProfilePicture` removes file from Firebase Storage
3. Database field is set to null

## Storage Organization

```
Firebase Storage
└── profile-pictures/
    ├── abc123def456.jpeg
    ├── xyz789uvw012.png
    └── ...
```

Each file has:
- **Random filename** (32 characters + extension) for security
- **Public access** for easy retrieval
- **Metadata** including content type

## Troubleshooting

### Error: "Could not load the default credentials"
- Make sure your `secrets/the-dj-society-firebase-adminsdk-fbsvc-806a7080c1.json` file exists
- Verify the service account has Storage Admin role in Firebase

### Error: "The caller does not have permission"
- Check your Firebase Storage security rules
- Ensure the service account has proper permissions in Firebase IAM

### Images not appearing
- Verify the file was uploaded successfully in Firebase Console > Storage
- Check that the filename in your database matches the file in Firebase
- Ensure files are marked as public (or adjust security rules)

### "File not found" errors
- The file may not exist in Firebase Storage
- Check for typos in folder names (e.g., "profile-pictures" vs "profile-picture")

## Rollback Plan

If you need to rollback to local storage:

1. Revert the changes using git:
   ```bash
   git checkout HEAD~1 src/app/services/firebase-storage.service.ts
   git checkout HEAD~1 src/app/models/images.model.ts
   git checkout HEAD~1 src/app/controllers/image.controller.ts
   git checkout HEAD~1 src/app/tools/image.tools.ts
   git checkout HEAD~1 src/config/firebase-admin.ts
   ```

2. Restore the local storage directory structure:
   ```bash
   mkdir -p storage/images/profile-picture
   ```

## Next Steps

- ✅ Test image upload/download functionality
- ✅ Update Firebase Storage security rules
- ✅ Consider migrating existing local images
- ✅ Update your deployment configuration (if needed)
- 🔄 Consider adding image optimization (resizing, compression)
- 🔄 Implement signed URLs for private images if needed
- 🔄 Add storage quota monitoring

## Additional Resources

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Admin SDK Storage Guide](https://firebase.google.com/docs/storage/admin/start)
- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
