import { supabase } from "@/integrations/supabase/client";

// Local Atlantique images
import a1 from "@/assets/atlantique-1.avif";
import a2 from "@/assets/atlantique-2.avif";
import a3 from "@/assets/atlantique-3.avif";
import a4 from "@/assets/atlantique-4.avif";
import a5 from "@/assets/atlantique-5.avif";
import a6 from "@/assets/atlantique-6.avif";
import a7 from "@/assets/atlantique-7.avif";
import a8 from "@/assets/atlantique-8.avif";
import a9 from "@/assets/atlantique-9.avif";
import a10 from "@/assets/atlantique-10.avif";

const localImages = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10];

export async function seedAtlantiqueImages(propertyId: string): Promise<{ success: number; errors: string[] }> {
  const errors: string[] = [];
  let success = 0;

  for (let i = 0; i < localImages.length; i++) {
    try {
      // Fetch the image as blob
      const response = await fetch(localImages[i]);
      const blob = await response.blob();

      const path = `${propertyId}/atlantique-${i + 1}.avif`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(path, blob, { contentType: "image/avif", upsert: true });

      if (uploadError) {
        errors.push(`Image ${i + 1}: ${uploadError.message}`);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);

      // Insert into property_images table
      const { error: insertError } = await supabase.from("property_images").insert({
        property_id: propertyId,
        image_url: urlData.publicUrl,
        display_order: i,
        alt_text: `Maison Atlantique — photo ${i + 1}`,
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
