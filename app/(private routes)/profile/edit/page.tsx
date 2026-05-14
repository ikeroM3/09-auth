"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@/lib/store/authStore";
import { updateMe } from "@/lib/api/clientApi";
import AvatarPicker from "@/components/AvatarPicker/AvatarPicker";

import css from "./EditProfilePage.module.css";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [username, setUsername] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        username: username.trim(),
        avatar: photoFile ? URL.createObjectURL(photoFile) : undefined,
      };

      console.log("SENDING:", payload);

      return updateMe(payload);
    },

    onSuccess: (data) => {
      setUser(data);
      router.push("/profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) return;

    mutation.mutate();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        {/* AVATAR */}
        <AvatarPicker
          profilePhotoUrl={user.avatar}
          onChangePhoto={setPhotoFile}
        />

        <form onSubmit={handleSubmit} className={css.profileInfo}>
          <div>
            <label>Username:</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={css.input}
            />
          </div>

          <p>Email: {user.email}</p>

          <div className={css.actions}>
            <button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </button>

            <button type="button" onClick={() => router.push("/profile")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
