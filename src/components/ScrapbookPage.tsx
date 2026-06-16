import { useEffect, useRef, useState } from 'react';
import type { Photo, User } from '../types';

interface Props {
  user: User;
}

export default function ScrapbookPage({ user: _user }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then((data: Photo[]) => setPhotos(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setStatusMsg(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}…`);

    const formData = new FormData();
    for (const file of files) formData.append('photos', file);

    const r = await fetch('/api/photos', { method: 'POST', body: formData });

    if (r.ok) {
      const newPhotos: Photo[] = await r.json();
      setPhotos(prev => [...newPhotos, ...prev]);
      setStatusMsg(`${newPhotos.length} photo${newPhotos.length !== 1 ? 's' : ''} added!`);
      setTimeout(() => setStatusMsg(null), 3000);
    } else {
      setStatusMsg('Upload failed — please try again.');
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
        <p className="text-stone-400 text-sm mb-6">
          Share your favorite memories for Lorraine's 90th Birthday
        </p>
        <input
          ref={fileInputRef}
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="photo-upload"
          className={`inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold px-8 py-3 rounded-full cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <UploadIcon />
          {uploading ? 'Uploading…' : 'Choose Photos'}
        </label>
        {statusMsg && (
          <p className="mt-4 text-sm text-stone-500">{statusMsg}</p>
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
