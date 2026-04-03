import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ImageInput({ name, onFileSelect, defaultImageUrl = null, maxSizeMB = 2 }: {
  name: string;
  onFileSelect: (file: File) => void;
  defaultImageUrl?: string | null;
  maxSizeMB?: number;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`La imagen supera los ${maxSizeMB}MB permitidos`);
      e.target.value = ""; 
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-24 h-24 rounded-full border-2 border-dashed border-green-500 flex items-center justify-center overflow-hidden bg-gray-50">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-xs text-center p-2">Sin foto</span>
        )}
      </div>

      <label htmlFor={name} className="cursor-pointer text-sm font-medium text-green-700 hover:text-green-800 transition-colors">
        Seleccionar imagen
        <input type="file" id={name} accept="image/png, image/jpeg, image/jpg" onChange={handleChange} hidden />
      </label>
    </div>
  );
}