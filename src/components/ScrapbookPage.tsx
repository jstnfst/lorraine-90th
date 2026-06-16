import { useEffect, useRef, useState } from 'react';
import type { Photo, User } from '../types';

const MAX_PHOTOS = 10;
const MAX_FILE_MB = 8;

interface UploadResult {
  uploaded: Photo[];
  skippedCount: number;
  oversized: string[];
}

interface Props {
  user: User;
}

export default function ScrapbookPage({ user }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then((data: Photo[]) => setPhotos(data))
      .finally(() => setLoading(false));
  }, []);

  const myCount = photos.filter(p => p.user_id === user.id).length;
  const slotsLeft = MAX_PHOTOS - myCount;
  const atLimit = slotsLeft <= 0;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setStatusMsg({ text: `Uploading…` });

    const formData = new FormData();
    for (const file of files) formData.append('photos', file);

    const r = await fetch('/api/photos', { method: 'POST', body: formData });
    const data = await r.json() as UploadResult & { error?: string };

    if (!r.ok) {
      setStatusMsg({ text: data.error ?? 'Upload failed — please try again.', error: true });
    } else {
      setPhotos(prev => [...data.uploaded, ...prev]);

      const parts: string[] = [];
      if (data.uploaded.length) parts.push(`${data.uploaded.length} photo${data.uploaded.length !== 1 ? 's' : ''} added`);
      if (data.oversized.length) parts.push(`${data.oversized.length} skipped (over ${MAX_FILE_MB} MB)`);
      if (data.skippedCount) parts.push(`${data.skippedCount} skipped (limit reached)`);

      setStatusMsg({ text: parts.join(' · '), error: !!(data.oversized.length || data.skippedCount) });
      setTimeout(() => setStatusMsg(null), 4000);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-8">
      {/* Upload card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gold-100 p-8 text-center">
        <h3 className="font-serif text-2xl font-semibold text-stone-700 mb-2">
          Add to the Scrapbook
        </h3>
        <p className="text-stone-400 text-sm mb-1">
          Share your favorite memories for Lorraine's 90th Birthday
        </p>
        <p className={`text-xs mb-6 ${atLimit ? 'text-red-400' : 'text-stone-300'}`}>
          {atLimit
            ? `You've uploaded all ${MAX_PHOTOS} of your photos`
            : `${slotsLeft} of ${MAX_PHOTOS} photos remaining · max ${MAX_FILE_MB} MB per photo`}
        </p>
        <input
          ref={fileInputRef}
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={atLimit || uploading}
          className="hidden"
        />
        <label
          htmlFor="photo-upload"
          className={`inline-flex items-center gap-2 bg-gold-500 text-white font-semibold px-8 py-3 rounded-full transition-colors ${
            atLimit || uploading
              ? 'opacity-40 cursor-not-allowed pointer-events-none'
              : 'hover:bg-gold-600 cursor-pointer'
          }`}
        >
          <UploadIcon />
          {uploading ? 'Uploading…' : atLimit ? 'Limit reached' : 'Choose Photos'}
        </label>
        {statusMsg && (
          <p className={`mt-4 text-sm ${statusMsg.error ? 'text-red-500' : 'text-stone-500'}`}>
            {statusMsg.text}
          </p>
        )}
      </div>

      {/* Gallery */}
      <div>
        {loading ? (
          <p className="text-stone-400 text-sm italic text-center">Loading photos…</p>
        ) : photos.length === 0 ? (
          <p className="text-stone-400 text-sm italic text-center">No photos yet — be the first to add one!</p>
        ) : (
          <>
            <p className="font-serif text-stone-500 text-sm mb-4">
              {photos.length} memor{photos.length !== 1 ? 'ies' : 'y'}
            </p>
            <div className="columns-2 sm:columns-3 gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="group relative break-inside-avoid mb-3 overflow-hidden rounded-xl bg-lavender-100 shadow-sm">
                  <img
                    src={`/api/photos/${photo.key}`}
                    alt={`Shared by ${photo.user_name}`}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <p className="text-white text-xs font-medium truncate">{photo.user_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
