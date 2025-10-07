# Cloudflare R2 Usage Guide

This guide shows how to use the Cloudflare R2 image upload functionality in your RealEstateSpotlight application.

## Overview

The Cloudflare R2 integration provides:
- Automatic image upload to Cloudflare R2 storage
- Fallback to local placeholder service when R2 is not configured
- Image upload component for React forms
- Server-side API endpoints for image management

## Frontend Usage

### Basic Image Upload Component

```tsx
import { ImageUpload } from "@/components/image-upload";

function MyForm() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div>
      <ImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        folder="properties"
        label="Property Image"
      />
    </div>
  );
}
```

### Component Props

- `value`: Current image URL (string)
- `onChange`: Callback function that receives the new image URL
- `folder`: R2 folder name (default: "properties")
- `label`: Label text for the upload area
- `className`: Additional CSS classes

### Example Integration in Property Form

```tsx
import { ImageUpload } from "@/components/image-upload";

export default function CreatePropertyForm() {
  const [property, setProperty] = useState({
    title: "",
    description: "",
    price: "",
    image: "", // This will store the R2 URL
    // ... other fields
  });

  const handleImageChange = (url: string) => {
    setProperty(prev => ({ ...prev, image: url }));
  };

  return (
    <form>
      <div className="space-y-4">
        <div>
          <label>Property Title</label>
          <input 
            value={property.title}
            onChange={(e) => setProperty(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <ImageUpload
          value={property.image}
          onChange={handleImageChange}
          folder="properties"
          label="Property Image"
        />

        {/* Other form fields */}
      </div>
    </form>
  );
}
```

## Backend API Endpoints

### Upload Image

```bash
POST /api/admin/upload/image
Content-Type: multipart/form-data

Form data:
- image: File (required)
- folder: string (optional, default: "properties")
```

**Response:**
```json
{
  "url": "https://pub-{account-id}.r2.dev/{bucket-name}/properties/{filename}",
  "key": "properties/{filename}",
  "message": "Image uploaded successfully"
}
```

### Delete Image

```bash
DELETE /api/admin/upload/image
Content-Type: application/json

{
  "key": "properties/{filename}"
}
```

**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

## Environment Configuration

Make sure your `.env` file contains:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ENDPOINT=https://{account-id}.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://pub-{account-id}.r2.dev
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id

# Image Upload Configuration
MAX_IMAGE_SIZE_MB=10
```

## Features

### Automatic Fallback
- If R2 credentials are not configured, the system automatically falls back to a local placeholder service
- No code changes needed - the same API works in both modes

### File Validation
- Only image files are accepted (image/* MIME types)
- Configurable file size limit (default: 10MB)
- Client-side and server-side validation

### Error Handling
- Comprehensive error messages
- Toast notifications for user feedback
- Graceful fallback on upload failures

### Security
- Environment variables for sensitive credentials
- File type validation
- Size limits to prevent abuse

## Testing

To test the R2 configuration:

1. Ensure all environment variables are set
2. Start your development server
3. Use the ImageUpload component in a form
4. Upload an image and verify it appears in your R2 bucket

## Troubleshooting

### Images Not Uploading
1. Check environment variables are correctly set
2. Verify R2 credentials are valid
3. Check browser console for error messages
4. Ensure the R2 bucket exists and is accessible

### Images Not Displaying
1. Verify the public URL format is correct
2. Check that public access is enabled on your R2 bucket
3. Ensure the bucket name is included in the public URL

### Fallback to Local Service
- This happens when R2 credentials are missing or invalid
- Check your `.env` file configuration
- Verify all required environment variables are present
