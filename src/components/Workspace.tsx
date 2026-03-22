import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES, PHOTOSHOOT_STYLES } from '../lib/modes';
import { Upload, Image as ImageIcon, Loader2, Maximize2, Download, RefreshCw, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { generateVisuals } from '../lib/ai';

interface WorkspaceProps {
  activeMode: string;
  onSelectMode: (mode: string) => void;
}

export default function Workspace({ activeMode, onSelectMode }: WorkspaceProps) {
  const modeConfig = MODES.find((m) => m.id === activeMode);
  
  const [images, setImages] = useState<Record<string, string | string[]>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [generateCount, setGenerateCount] = useState<number>(2);

  // Reset state when mode changes
  useEffect(() => {
    setImages({});
    setFormData(activeMode === 'imajinasi' ? { aspectRatio: '1:1' } : {});
    setResults([]);
    setIsGenerating(false);
    setFullscreenImage(null);
    setGenerateCount(2);
  }, [activeMode]);

  const handleImageUpload = (field: string, file: File, multiple: boolean = false) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (field === 'image' || (field === 'mixImages' && (!images['mixImages'] || images['mixImages'].length === 0))) {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          let closestRatio = '1:1';
          if (ratio > 1.5) closestRatio = '16:9';
          else if (ratio > 1.1) closestRatio = '4:3';
          else if (ratio > 0.85) closestRatio = '1:1';
          else if (ratio > 0.65) closestRatio = '3:4';
          else closestRatio = '9:16';
          
          setFormData(prev => ({ ...prev, originalAspectRatio: closestRatio }));
        };
        img.src = result;
      }

      if (multiple) {
        setImages(prev => {
          const current = prev[field] || [];
          return { ...prev, [field]: [...(Array.isArray(current) ? current : []), result] };
        });
      } else {
        setImages(prev => ({ ...prev, [field]: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field: string, index?: number) => {
    setImages(prev => {
      const newImages = { ...prev };
      if (index !== undefined) {
        const current = newImages[field] as string[];
        if (Array.isArray(current)) {
          const updated = [...current];
          updated.splice(index, 1);
          newImages[field] = updated;
        }
      } else {
        delete newImages[field];
      }
      return newImages;
    });
  };

  const handleGenerate = async () => {
    if (!modeConfig) return;
    setIsGenerating(true);
    setResults([]);
    
    // Generate 2 variations for all modes except mix
    const targetCount = modeConfig.id === 'mix' ? generateCount : 2;

    try {
      const generatedImages = await generateVisuals({
        mode: modeConfig.id,
        images,
        formData,
        count: targetCount,
      });
      setResults(generatedImages);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Gagal membuat visual. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isReady = () => {
    if (!modeConfig) return false;
    for (const field of modeConfig.requiredFields) {
      if (!images[field] && !formData[field]) return false;
    }
    if (activeMode === 'photoshoot' && formData['photoshootStyle'] === 'Studio Berwarna' && !formData['photoshootColor']) {
      return false;
    }
    return true;
  };

  if (activeMode === 'home') {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col items-center">
        <div className="max-w-5xl w-full space-y-12 mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Mau bikin apa hari ini?
            </h1>
            <p className="text-lg text-blue-200/70 max-w-2xl mx-auto">
              Pilih mode di bawah ini buat mulai kreasi visual kamu. Dari ngedit foto, ganti baju, sampai bikin gambar dari imajinasi, semuanya gampang banget!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODES.map((mode, idx) => {
              const IconComponent = (Icons as any)[mode.icon] || Icons.Box;
              return (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectMode(mode.id)}
                  className="glass-panel p-6 rounded-2xl text-left hover:bg-white/10 transition-all duration-300 group border border-white/5 hover:border-blue-500/30 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{mode.name}</h3>
                  <p className="text-sm text-blue-200/60 leading-relaxed">
                    {mode.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!modeConfig) return null;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Mode Title */}
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-2">{modeConfig.name}</h2>
          <p className="text-blue-200/70">{modeConfig.description}</p>
        </motion.div>

        {/* Inputs Area */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modeConfig.requiredFields.includes('image') && (
              <ImageUploadBox
                label="Unggah Foto Utama"
                onUpload={(file: File) => handleImageUpload('image', file)}
                onRemove={() => handleRemoveImage('image')}
                preview={images['image'] as string}
              />
            )}
            {modeConfig.optionalFields.includes('poseImage') && (
              <ImageUploadBox
                label="Referensi Pose (Opsional)"
                onUpload={(file: File) => handleImageUpload('poseImage', file)}
                onRemove={() => handleRemoveImage('poseImage')}
                preview={images['poseImage'] as string}
              />
            )}
            {modeConfig.optionalFields.includes('modelImages') && (
              <ImageUploadBox
                label="Foto Model (Opsional, Bisa Banyak)"
                multiple
                onUpload={(file: File) => handleImageUpload('modelImages', file, true)}
                onRemove={(index: number) => handleRemoveImage('modelImages', index)}
                previews={images['modelImages'] as string[]}
              />
            )}
            {modeConfig.requiredFields.includes('clothingImages') && (
              <ImageUploadBox
                label="Foto Busana (Bisa Banyak)"
                multiple
                onUpload={(file: File) => handleImageUpload('clothingImages', file, true)}
                onRemove={(index: number) => handleRemoveImage('clothingImages', index)}
                previews={images['clothingImages'] as string[]}
              />
            )}
            {modeConfig.requiredFields.includes('mixImages') && (
              <ImageUploadBox
                label="Foto untuk Mix (Max 6)"
                multiple
                onUpload={(file: File) => handleImageUpload('mixImages', file, true)}
                onRemove={(index: number) => handleRemoveImage('mixImages', index)}
                previews={images['mixImages'] as string[]}
              />
            )}
          </div>

          {/* Text Inputs */}
          <div className="space-y-4">
            {(modeConfig.requiredFields.includes('title') || modeConfig.optionalFields.includes('title')) && (
              <InputField
                label="Judul"
                value={formData['title'] || ''}
                onChange={(v) => setFormData({ ...formData, title: v })}
                placeholder="Masukkan judul..."
              />
            )}
            {(modeConfig.requiredFields.includes('subtitle') || modeConfig.optionalFields.includes('subtitle')) && (
              <div className="space-y-1">
                <InputField
                  label="Sub Judul / Deskripsi"
                  value={formData['subtitle'] || ''}
                  onChange={(v) => setFormData({ ...formData, subtitle: v })}
                  placeholder="Masukkan sub judul..."
                />
                <p className="text-xs text-blue-200/50 px-1">Tips: Gunakan teks singkat (1-2 kalimat). AI terkadang salah mengeja kalimat yang terlalu panjang.</p>
              </div>
            )}
            {(modeConfig.requiredFields.includes('brandName') || modeConfig.optionalFields.includes('brandName')) && (
              <InputField
                label="Nama Brand"
                value={formData['brandName'] || ''}
                onChange={(v) => setFormData({ ...formData, brandName: v })}
                placeholder="Masukkan nama brand..."
              />
            )}
            {(modeConfig.requiredFields.includes('tagline') || modeConfig.optionalFields.includes('tagline')) && (
              <div className="space-y-1">
                <InputField
                  label="Tagline"
                  value={formData['tagline'] || ''}
                  onChange={(v) => setFormData({ ...formData, tagline: v })}
                  placeholder="Masukkan tagline..."
                />
                <p className="text-xs text-blue-200/50 px-1">Tips: Gunakan teks singkat. AI terkadang salah mengeja kalimat yang terlalu panjang.</p>
              </div>
            )}
            {(modeConfig.requiredFields.includes('prompt') || modeConfig.optionalFields.includes('prompt')) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Arahan (Prompt) {modeConfig.optionalFields.includes('prompt') ? '(Opsional)' : ''}</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-24"
                  placeholder="Jelaskan detail visual yang Anda inginkan..."
                  value={formData['prompt'] || ''}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                />
              </div>
            )}
            {modeConfig.requiredFields.includes('aspectRatio') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Rasio Gambar</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={formData['aspectRatio'] || '1:1'}
                  onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
                >
                  <option value="1:1" className="bg-slate-800">1:1 (Persegi)</option>
                  <option value="16:9" className="bg-slate-800">16:9 (Lanskap / YouTube)</option>
                  <option value="9:16" className="bg-slate-800">9:16 (Potret / TikTok/Reels)</option>
                  <option value="4:3" className="bg-slate-800">4:3 (Lanskap Standar)</option>
                  <option value="3:4" className="bg-slate-800">3:4 (Potret Standar)</option>
                </select>
              </div>
            )}
            {modeConfig.id === 'photoshoot' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Pilih Style Photoshoot</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={formData['photoshootStyle'] || ''}
                    onChange={(e) => setFormData({ ...formData, photoshootStyle: e.target.value })}
                  >
                    <option value="" disabled className="bg-slate-800">-- Pilih Style --</option>
                    {PHOTOSHOOT_STYLES.map(style => (
                      <option key={style} value={style} className="bg-slate-800">{style}</option>
                    ))}
                  </select>
                </div>
                {formData['photoshootStyle'] === 'Studio Berwarna' && (
                  <InputField
                    label="Warna Studio (Contoh: Merah Maroon, Biru Navy, Pastel Pink)"
                    value={formData['photoshootColor'] || ''}
                    onChange={(v: string) => setFormData({ ...formData, photoshootColor: v })}
                    placeholder="Masukkan warna background..."
                  />
                )}
              </div>
            )}
          </div>

          {/* Generate Options */}
          {modeConfig.id === 'mix' && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-blue-200">Jumlah Generate:</label>
              <select 
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={generateCount}
                onChange={(e) => setGenerateCount(Number(e.target.value))}
              >
                {[2,3,4,5,6].map(n => <option key={n} value={n} className="bg-slate-800">{n} Gambar</option>)}
              </select>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex flex-col items-center pt-4 space-y-3">
            <button
              onClick={handleGenerate}
              disabled={!isReady() || isGenerating}
              className={`relative overflow-hidden group px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                isReady() && !isGenerating
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses AI...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    {modeConfig.id === 'mix' ? `Buat ${generateCount} Visual` : 'Buat 2 Variasi Visual'}
                  </>
                )}
              </span>
              {isReady() && !isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              )}
            </button>
            {modeConfig.id !== 'mix' && (
              <p className="text-sm font-medium text-blue-200/70 text-center">
                Sistem akan menghasilkan 2 variasi gambar untuk Anda pilih.
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center space-y-4"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin animation-delay-150" />
                <div className="absolute inset-4 rounded-full border-b-2 border-cyan-500 animate-spin animation-delay-300" />
              </div>
              <p className="text-blue-200 animate-pulse">AI sedang meracik visual profesional Anda...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {results.length > 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold">Hasil Visual</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {results.map((url, idx) => (
                <ResultCard
                  key={idx}
                  url={url}
                  onFullscreen={() => setFullscreenImage(url)}
                  onRegenerate={handleGenerate}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={fullscreenImage}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
              onClick={() => setFullscreenImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageUploadBox({ label, onUpload, onRemove, preview, previews, multiple }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        Array.from(e.target.files).forEach(file => onUpload(file));
      } else {
        onUpload(e.target.files[0]);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-blue-200">{label}</label>
      <div 
        className={`border-2 border-dashed border-white/20 rounded-xl p-4 hover:border-blue-400/50 transition-colors bg-white/5 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group ${!previews?.length && !preview ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (!preview && (!previews || previews.length === 0)) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
        />
        
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} 
                className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 text-white transition-transform hover:scale-110" 
                title="Ganti Gambar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }} 
                className="p-3 bg-red-600 rounded-full hover:bg-red-500 text-white transition-transform hover:scale-110" 
                title="Hapus Gambar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : previews && previews.length > 0 ? (
          <div className="absolute inset-0 p-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-2">
              {previews.map((p: string, i: number) => (
                <div key={i} className="relative group/item aspect-square rounded-lg overflow-hidden border border-white/10">
                  <img src={p} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemove(i); }} 
                      className="p-2 bg-red-600/90 hover:bg-red-500 rounded-full text-white transition-transform hover:scale-110"
                      title="Hapus"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="aspect-square border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400/50 hover:bg-white/5 transition-colors group/add"
              >
                <Upload className="w-6 h-6 text-blue-400 mb-1 group-hover/add:scale-110 transition-transform" />
                <span className="text-xs text-white/50 text-center px-1">Tambah Foto</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm text-white/50">Klik untuk mengunggah gambar</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-blue-200">{label}</label>
      <input
        type="text"
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ResultCard({ url, onFullscreen, onRegenerate }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group rounded-2xl overflow-hidden glass-panel aspect-auto"
    >
      <img src={url} alt="Generated Visual" className="w-full h-auto object-contain" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex items-center justify-center gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={onFullscreen}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md text-white transition"
            title="Pratinjau Penuh"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <a 
            href={url} 
            download="kreasi-ai-result.png"
            className="p-2 bg-blue-600/80 hover:bg-blue-500 rounded-full backdrop-blur-md text-white transition"
            title="Unduh"
          >
            <Download className="w-5 h-5" />
          </a>
          <button 
            onClick={onRegenerate}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md text-white transition"
            title="Generate Ulang"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
