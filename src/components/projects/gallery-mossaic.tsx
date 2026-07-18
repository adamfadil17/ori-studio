import Image from "next/image";

interface GalleryMosaicProps {
  images: string[];
  alt: string;
}

/**
 * Layout bento untuk 5 gambar pertama:
 * - Kolom kiri: 2 gambar kecil bersebelahan di atas, 1 gambar besar di bawah
 * - Kolom kanan: 2 gambar bertumpuk (atas & bawah)
 * Aspect ratio tiap gambar diatur supaya tinggi total kolom kiri & kanan
 * tetap sejajar. Gambar ke-6+ (kalau ada) tampil sebagai banner lebar
 * penuh di bawahnya.
 */
export default function GalleryMosaic({ images, alt }: GalleryMosaicProps) {
  const [first, second, third, fourth, fifth, ...rest] = images;
  const mainFive = [first, second, third, fourth, fifth].filter(Boolean);

  return (
    <div className="mt-10 space-y-4">
      {mainFive.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Kolom kiri: 2 gambar kecil di atas, 1 gambar besar di bawah */}
          <div className="flex flex-col gap-4">
            {(first || second) && (
              <div className="grid grid-cols-2 gap-4">
                {first && (
                  <div className="relative aspect-[6/5] overflow-hidden bg-background-alt">
                    <Image
                      src={first}
                      alt={alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {second && (
                  <div className="relative aspect-[6/5] overflow-hidden bg-background-alt">
                    <Image
                      src={second}
                      alt={alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {fourth && (
              <div className="relative aspect-[5/4] overflow-hidden bg-background-alt">
                <Image src={fourth} alt={alt} fill className="object-cover" />
              </div>
            )}
          </div>

          {/* Kolom kanan: 2 gambar bertumpuk */}
          {(third || fifth) && (
            <div className="flex flex-col gap-4">
              {third && (
                <div className="relative aspect-[5/3] overflow-hidden bg-background-alt">
                  <Image src={third} alt={alt} fill className="object-cover" />
                </div>
              )}
              {fifth && (
                <div className="relative aspect-[5/3] overflow-hidden bg-background-alt">
                  <Image src={fifth} alt={alt} fill className="object-cover" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rest.map((image, index) => (
            <div
              key={index}
              className="relative aspect-[16/9] overflow-hidden bg-background-alt"
            >
              <Image src={image} alt={alt} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
