import { supabase } from "@/integrations/supabase/client";

import g5 from "@/assets/georgia-5.jpg";
import g6 from "@/assets/georgia-6.png";
import g7 from "@/assets/georgia-7.png";
import g8 from "@/assets/georgia-8.jpg";
import g9 from "@/assets/georgia-9.png";
import g10 from "@/assets/georgia-10.png";
import g11 from "@/assets/georgia-11.png";
import g12 from "@/assets/georgia-12.png";
import g13 from "@/assets/georgia-13.jpg";
import g14 from "@/assets/georgia-14.jpg";

const localImages = [
  { src: g10, ext: "png" },
  { src: g5, ext: "jpg" },
  { src: g6, ext: "png" },
  { src: g7, ext: "png" },
  { src: g8, ext: "jpg" },
  { src: g9, ext: "png" },
  { src: g11, ext: "png" },
  { src: g12, ext: "png" },
  { src: g13, ext: "jpg" },
  { src: g14, ext: "jpg" },
];

export async function seedGeorgiaImages(propertyId: string): Promise<{ success: number; errors: string[] }> {
  const errors: string[] = [];
  let success = 0;

  for (let i = 0; i < localImages.length; i++) {
    try {
      const response = await fetch(localImages[i].src);
      const blob = await response.blob();

      const ext = localImages[i].ext;
      const contentType = ext === "jpg" ? "image/jpeg" : "image/png";
      const path = `${propertyId}/georgia-${i + 1}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(path, blob, { contentType, upsert: true });

      if (uploadError) {
        errors.push(`Image ${i + 1}: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);

      const { error: insertError } = await supabase.from("property_images").insert({
        property_id: propertyId,
        image_url: urlData.publicUrl,
        display_order: i,
        alt_text: `Maison Georgia — photo ${i + 1}`,
      } as any);

      if (insertError) {
        errors.push(`Image ${i + 1} DB: ${insertError.message}`);
        continue;
      }

      success++;
    } catch (e: any) {
      errors.push(`Image ${i + 1}: ${e.message}`);
    }
  }

  return { success, errors };
}
