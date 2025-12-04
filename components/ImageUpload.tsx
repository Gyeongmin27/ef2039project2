'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

export type TPO = {
  time: string;
  place: string;
  occasion: string;
};

interface ImageUploadProps {
  onImageSelect: (file: File, tpo: TPO) => void;
  selectedImage?: File | null;
  imagePreview?: string | null;
}

export default function ImageUpload({
  onImageSelect,
  selectedImage,
  imagePreview,
}: ImageUploadProps) {
  const [tpo, setTpo] = useState<TPO>({
    time: '',
    place: '',
    occasion: '',
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0], tpo);
      }
    },
    [onImageSelect, tpo]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const handleTpoChange = (field: keyof TPO, value: string) => {
    setTpo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full space-y-4">
      {/* TPO 선택 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">상황 선택 (TPO)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              시간 (Time)
            </label>
            <select
              value={tpo.time}
              onChange={(e) => handleTpoChange('time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="text-gray-500">선택하세요</option>
              <option value="morning" className="text-gray-900">아침</option>
              <option value="afternoon" className="text-gray-900">오후</option>
              <option value="evening" className="text-gray-900">저녁</option>
              <option value="night" className="text-gray-900">밤</option>
            </select>
          </div>

          {/* Place */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              장소 (Place)
            </label>
            <select
              value={tpo.place}
              onChange={(e) => handleTpoChange('place', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="text-gray-500">선택하세요</option>
              <option value="office" className="text-gray-900">사무실</option>
              <option value="school" className="text-gray-900">학교</option>
              <option value="cafe" className="text-gray-900">카페</option>
              <option value="restaurant" className="text-gray-900">레스토랑</option>
              <option value="party" className="text-gray-900">파티/행사</option>
              <option value="outdoor" className="text-gray-900">야외</option>
              <option value="casual" className="text-gray-900">캐주얼</option>
            </select>
          </div>

          {/* Occasion */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              상황 (Occasion)
            </label>
            <select
              value={tpo.occasion}
              onChange={(e) => handleTpoChange('occasion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="text-gray-500">선택하세요</option>
              <option value="daily" className="text-gray-900">일상</option>
              <option value="business" className="text-gray-900">비즈니스</option>
              <option value="date" className="text-gray-900">데이트</option>
              <option value="formal" className="text-gray-900">정장</option>
              <option value="casual" className="text-gray-900">캐주얼</option>
              <option value="sport" className="text-gray-900">운동</option>
            </select>
          </div>
        </div>
      </div>

      {/* 이미지 업로드 */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {isDragActive ? (
            <p className="text-blue-600 font-medium">이미지를 여기에 놓으세요</p>
          ) : (
            <>
              <p className="text-gray-600">
                이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요
              </p>
              <p className="text-sm text-gray-400">
                JPG, PNG, WebP (최대 20MB)
              </p>
            </>
          )}
        </div>
      </div>

      {imagePreview && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={imagePreview}
            alt="업로드된 이미지"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      )}
    </div>
  );
}

