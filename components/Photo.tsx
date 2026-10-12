import type { PhotoData } from "@/lib/types";

type Props = {
  photo: { file_url: string | null; data: PhotoData };
  className?: string;
  showCaption?: boolean;
};

// แสดงรูปจริงถ้ามี file_url ไม่งั้นแสดงกล่องสี placeholder พร้อมชื่อสถานที่
export function Photo({ photo, className = "", showCaption = false }: Props) {
  const { caption, place, color } = photo.data;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {photo.file_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- รูปจาก Supabase Storage ขนาดไม่แน่นอน
        <img src={photo.file_url} alt={caption} className="h-full w-full object-cover" />
      ) : (
        <div
          role="img"
          aria-label={caption}
          className="flex h-full w-full items-end p-3"
          style={{
            background: `linear-gradient(160deg, ${color} 0%, ${color}cc 55%, #2B2019 130%)`,
          }}
        >
          {!showCaption && (
            <span className="text-sm font-medium text-cream/90 drop-shadow">{place}</span>
          )}
        </div>
      )}
      {showCaption && (
        <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-sm text-cream">
          {caption}
        </p>
      )}
    </div>
  );
}
