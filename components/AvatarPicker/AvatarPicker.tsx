"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import css from "./AvatarPicker.module.css";
type Props = {
  profilePhotoUrl?: string;
  onChangePhoto: (file: File | null) => void;
};

export default function AvatarPicker({
  profilePhotoUrl,
  onChangePhoto,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profilePhotoUrl) {
      setPreviewUrl(profilePhotoUrl);
    }
  }, [profilePhotoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only images allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Max 5MB");
      return;
    }

    onChangePhoto(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onChangePhoto(null);
  };

  return (
    <div>
      <div className={css.picker}>
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="avatar"
            width={140}
            height={140}
            className={css.avatar}
          />
        ) : (
          <label className={css.wrapper}>
            📷 Choose photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={css.input}
            />
          </label>
        )}

        {previewUrl && (
          <label className={`${css.wrapper} ${css.reload}`}>
            📷 Change
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={css.input}
            />
          </label>
        )}

        {previewUrl && (
          <button type="button" className={css.remove} onClick={handleRemove}>
            ✕
          </button>
        )}
      </div>

      {error && <p className={css.error}>{error}</p>}
    </div>
  );
}
