import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GenerateParams {
  mode: string;
  images: Record<string, string | string[]>;
  formData: Record<string, string>;
  count: number;
}

export async function generateVisuals({ mode, images, formData, count }: GenerateParams): Promise<string[]> {
  const generatedUrls: string[] = [];
  
  // Helper to extract base64 data and mime type
  const getBase64Data = (dataUrl: string) => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    return { data, mimeType };
  };

  // Build the prompt based on the mode
  let basePrompt = '';
  const mainImage = images['image'] as string;
  const mixImages = images['mixImages'] as string[];
  
  switch (mode) {
    case 'imajinasi':
      basePrompt = `[MODE IMAJINASI] Buat gambar berdasarkan deskripsi berikut: ${formData.prompt}. Buat dengan kualitas sangat tinggi, detail, dan profesional.`;
      break;
    case 'pose':
      basePrompt = `[MODE UBAH POSE] Ubah pose karakter/model dalam gambar utama mengikuti referensi pose yang diberikan. Wajah dan identitas HARUS TETAP SAMA. ${formData.prompt ? 'Arahan tambahan: ' + formData.prompt : ''}`;
      break;
    case 'edit':
      basePrompt = `[MODE EDIT FOTO] Edit gambar ini sesuai arahan: ${formData.prompt}. PENTING: JANGAN ubah background, JANGAN ubah posisi, JANGAN ubah bentuk tubuh utama, KECUALI secara eksplisit diminta dalam arahan.`;
      break;
    case 'product':
      basePrompt = `[MODE FOTO PRODUK] Buat foto katalog produk profesional dari gambar produk ini. ${formData.prompt ? 'Arahan: ' + formData.prompt : 'Buat terlihat premium dan elegan.'}`;
      break;
    case 'thumbnail':
      basePrompt = `[MODE THUMBNAIL YOUTUBE] Buat desain thumbnail YouTube/konten yang clickbait dan menarik. JANGAN ubah gambar utama kecuali diminta. 

INSTRUKSI TEKS SANGAT PENTING:
Kamu WAJIB menuliskan teks tipografi besar di dalam gambar dengan ejaan yang 100% PERSIS, huruf demi huruf, tanpa typo:
- Judul Utama: "${formData.title}"
${formData.subtitle ? '- Sub-judul: "' + formData.subtitle + '"\n' : ''}
Fokus utama kamu adalah memastikan teks ini terbaca jelas, besar, dan ejaannya sempurna. Dilarang keras membuat kata-kata aneh atau typo. ${formData.prompt ? 'Arahan gaya: ' + formData.prompt : ''}`;
      break;
    case 'poster':
      basePrompt = `[MODE POSTER PROMOSI] Buat desain poster promosi profesional. 

INSTRUKSI TEKS SANGAT PENTING:
Kamu WAJIB menuliskan teks tipografi di dalam gambar dengan ejaan yang 100% PERSIS, huruf demi huruf, tanpa typo:
- Judul Utama: "${formData.title}"
${formData.subtitle ? '- Sub-judul: "' + formData.subtitle + '"\n' : ''}
Fokus utama kamu adalah memastikan teks ini terbaca jelas dan ejaannya sempurna. Dilarang keras membuat kata-kata aneh atau typo. ${formData.prompt ? 'Arahan: ' + formData.prompt : ''}`;
      break;
    case 'photoshoot':
      const style = formData.photoshootStyle;
      const colorInfo = style === 'Studio Berwarna' && formData.photoshootColor ? ` dengan warna background ${formData.photoshootColor}` : '';
      basePrompt = `[MODE PHOTOSHOOT STUDIO] Ubah foto ini menjadi hasil pemotretan studio profesional (photoshoot) dengan tema/style: "${style}"${colorInfo}. Tingkatkan pencahayaan, kualitas, dan tone warna agar terlihat seperti diambil oleh fotografer profesional sungguhan sesuai dengan tema tersebut. Wajah dan identitas orang HARUS TETAP SAMA. ${formData.prompt ? 'Arahan tambahan: ' + formData.prompt : ''}`;
      break;
    case 'logo':
      basePrompt = `[MODE DESAIN LOGO] Buat desain logo profesional. 

INSTRUKSI TEKS SANGAT PENTING:
Kamu WAJIB menuliskan teks di dalam logo dengan ejaan yang 100% PERSIS, huruf demi huruf, tanpa typo:
- Nama Brand: "${formData.brandName}"
${formData.tagline ? '- Tagline: "' + formData.tagline + '"\n' : ''}
Fokus utama kamu adalah memastikan teks ini terbaca jelas dan ejaannya sempurna. Dilarang keras membuat kata-kata aneh atau typo. ${formData.prompt ? 'Gaya logo: ' + formData.prompt : 'Gaya modern minimalis.'}`;
      break;
    case 'busana':
      basePrompt = `[MODE COBA BUSANA] Pakaikan busana dari gambar referensi ke model di gambar utama. PENTING: JANGAN ubah background, JANGAN ubah bentuk tubuh, JANGAN ubah posisi model. Hanya ganti pakaiannya saja secara realistis. ${formData.prompt ? 'Arahan tambahan: ' + formData.prompt : ''}`;
      break;
    case 'mix':
      basePrompt = `[MODE MIX FOTO] Gabungkan elemen-elemen dari foto-foto referensi ini menjadi satu komposisi visual yang harmonis dan profesional. ${formData.prompt ? 'Arahan penggabungan: ' + formData.prompt : ''}`;
      break;
    default:
      basePrompt = formData.prompt || 'Tingkatkan kualitas gambar ini.';
  }

  // Prepare parts for the API call
  const parts: any[] = [];
  
  // Add main image if exists
  if (mainImage) {
    const { data, mimeType } = getBase64Data(mainImage);
    parts.push({ inlineData: { data, mimeType } });
  }

  // Add pose image if exists
  if (images['poseImage']) {
    const { data, mimeType } = getBase64Data(images['poseImage'] as string);
    parts.push({ inlineData: { data, mimeType } });
    basePrompt += " [Gunakan gambar kedua sebagai referensi pose].";
  }

  // Add model images if exists
  if (images['modelImages']) {
    const models = images['modelImages'] as string[];
    models.forEach((m) => {
      const { data, mimeType } = getBase64Data(m);
      parts.push({ inlineData: { data, mimeType } });
    });
    basePrompt += ` [Gunakan ${models.length} gambar tambahan sebagai referensi model/gaya].`;
  }

  // Add clothing images if exists
  if (images['clothingImages']) {
    const clothes = images['clothingImages'] as string[];
    clothes.forEach((c, i) => {
      const { data, mimeType } = getBase64Data(c);
      parts.push({ inlineData: { data, mimeType } });
    });
    basePrompt += ` [Gunakan ${clothes.length} gambar terakhir sebagai referensi busana].`;
  }

  // Add mix images if exists
  if (mixImages && mixImages.length > 0) {
    mixImages.forEach((img) => {
      const { data, mimeType } = getBase64Data(img);
      parts.push({ inlineData: { data, mimeType } });
    });
  }

  // Generate multiple variations in parallel
  const promises = Array.from({ length: count }).map(async (_, index) => {
    // Add variation instruction to ensure different results
    const variationPrompt = `${basePrompt} \n\nInstruksi Variasi ${index + 1}: Buat variasi yang unik dan berbeda dari yang lain. Ubah sedikit angle kamera, pencahayaan (lighting), komposisi, atau tone warna agar hasil ini memiliki nuansa tersendiri namun tetap mengikuti arahan utama.`;
    
    const callParts = [...parts, { text: variationPrompt }];

    let aspectRatio = '1:1';
    if (mode === 'imajinasi') {
      aspectRatio = formData.aspectRatio || '1:1';
    } else if (formData.originalAspectRatio) {
      aspectRatio = formData.originalAspectRatio;
    } else if (mode === 'thumbnail') {
      aspectRatio = '16:9';
    } else if (mode === 'poster') {
      aspectRatio = '3:4';
    } else if (mode === 'photoshoot') {
      aspectRatio = '3:4';
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: callParts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          }
        }
      });

      // Extract image from response
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64EncodeString}`;
        }
      }
    } catch (err) {
      console.error(`Error generating variation ${index + 1}:`, err);
    }
    return null;
  });

  const results = await Promise.all(promises);
  
  // Filter out failed generations
  const validResults = results.filter((r): r is string => r !== null);
  
  if (validResults.length === 0) {
    throw new Error("Gagal menghasilkan gambar dari AI.");
  }

  return validResults;
}
