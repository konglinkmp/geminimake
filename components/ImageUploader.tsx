import React, { useRef, useState } from 'react';
import { Button } from './Button';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  selectedPreview?: string;
  isProcessing?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  selectedPreview,
  isProcessing 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  if (selectedPreview) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square rounded-xl overflow-hidden shadow-lg group">
        <img 
          src={selectedPreview} 
          alt="Selected Item" 
          className="w-full h-full object-cover"
        />
        {!isProcessing && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button variant="secondary" onClick={triggerUpload}>
               Change Item
             </Button>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>
    );
  }

  return (
    <div 
      className={`
        w-full max-w-md mx-auto aspect-[4/3] rounded-xl border-2 border-dashed 
        flex flex-col items-center justify-center p-8 transition-colors cursor-pointer
        ${isDragging ? 'border-stone-600 bg-stone-100' : 'border-stone-300 bg-white hover:bg-stone-50'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerUpload}
    >
      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-serif font-bold text-stone-800 mb-2">Upload your item</h3>
      <p className="text-sm text-stone-500 text-center">
        Click to browse or drag and drop<br/>a photo of clothing (skirt, shirt, etc.)
      </p>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};