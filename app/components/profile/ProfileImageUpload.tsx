'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { useToast } from '../../lib/hooks/useToast';
import Button from '../ui/Button';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageUpload: (file: File) => Promise<void>;
  userName: string;
}

const ProfileImageUpload = ({
  currentImage,
  onImageUpload,
  userName
}: ProfileImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error: showError } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);
  // app/lib/imageUtils.ts

  const validateImageFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, or WebP image.';
    }

    if (file.size > maxSizeInBytes) {
      return 'File size too large. Please upload an image smaller than 5MB.';
    }

    return null;
  };

  const compressImage = async (file: File, quality = 0.8, maxWidth = 800): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas back to file/blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg', // Standardize to jpeg for better compression
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);
    });
  };
  const handleFileSelection = async (file: File) => {
    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setIsUploading(true);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Compress image
      const compressedFile = await compressImage(file);

      // Upload image
      await onImageUpload(compressedFile);

      // Clear preview after successful upload
      setPreviewImage(null);
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      showError('Failed to upload image. Please try again.');
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = previewImage || currentImage;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Image Display */}
      <div className="relative group">
        <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 border-4 border-white shadow-2xl ring-4 ring-blue-100 transition-all duration-300 group-hover:ring-blue-200">
          {displayImage ? (
            <img
              src={displayImage}
              alt={userName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <User className="w-16 h-16 text-gray-600" />
            </div>
          )}
        </div>

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <span className="text-sm font-semibold">Uploading...</span>
            </div>
          </div>
        )}

        {/* Camera Icon Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-200"
          aria-label="Change profile picture"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer transform hover:scale-105
          ${isDragging
            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800 mb-1">
              {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-600">
              PNG, JPG, WebP up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          Choose File
        </Button>

        {(previewImage || currentImage) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Instructions */}
      <div className="text-center max-w-sm">
        <p className="text-sm text-gray-700 leading-relaxed">
          Your profile photo helps patients and colleagues recognize you.
          Choose a clear, professional photo for the best results.
        </p>
      </div>
    </div>
  );
};

export default ProfileImageUpload;