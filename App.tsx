import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { OutfitCard } from './components/OutfitCard';
import { Button } from './components/Button';
import { UploadedItem, GeneratedOutfit, StyleCategory } from './types';
import { fileToBase64, generateOutfitForStyle, editOutfitImage } from './services/geminiService';

const App: React.FC = () => {
  const [uploadedItem, setUploadedItem] = useState<UploadedItem | null>(null);
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setUploadedItem({
        file,
        previewUrl: URL.createObjectURL(file),
        base64
      });
      // Reset previous results when new item is uploaded
      setOutfits([]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to process the uploaded image.");
    }
  };

  const startStyling = async () => {
    if (!uploadedItem) return;

    setIsGenerating(true);
    setError(null);

    // Initialize skeletons
    const skeletons: GeneratedOutfit[] = Object.values(StyleCategory).map(style => ({
      id: `skeleton-${style}`,
      style,
      imageUrl: '',
      description: '',
      isLoading: true
    }));
    setOutfits(skeletons);

    try {
      // Parallel requests for speed
      const promises = Object.values(StyleCategory).map(async (style) => {
        try {
          const generatedImage = await generateOutfitForStyle(uploadedItem.base64, style);
          return {
            id: crypto.randomUUID(),
            style,
            imageUrl: generatedImage,
            description: `A ${style} look featuring your item.`,
            isLoading: false
          } as GeneratedOutfit;
        } catch (e) {
            console.error(e);
            return null;
        }
      });

      const results = await Promise.all(promises);
      
      const validResults = results.filter((r): r is GeneratedOutfit => r !== null);
      if (validResults.length === 0) {
          throw new Error("Unable to generate any outfits. Please try a different image.");
      }
      
      // Update state, replacing skeletons with results
      setOutfits(validResults);
    } catch (err: any) {
      setError(err.message || "Something went wrong while styling.");
      setOutfits([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditOutfit = async (id: string, prompt: string) => {
    const targetOutfit = outfits.find(o => o.id === id);
    if (!targetOutfit) return;

    // Set local loading state for this specific card handled by the component, 
    // but here we act as the data manager.
    // For simplicity, we just update the specific item URL when done.
    
    try {
      const newImageUrl = await editOutfitImage(targetOutfit.imageUrl, prompt);
      
      setOutfits(prev => prev.map(o => {
        if (o.id === id) {
          return { ...o, imageUrl: newImageUrl };
        }
        return o;
      }));
    } catch (err) {
      console.error(err);
      alert("Could not refine the image. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-white font-serif font-bold">V</div>
            <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">Virtual Stylist</h1>
          </div>
          {uploadedItem && !isGenerating && outfits.length === 0 && (
             <Button onClick={startStyling} disabled={isGenerating}>
               Generate Outfits
             </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 space-y-12">
        
        {/* Hero Section / Upload */}
        <section className={`transition-all duration-500 ${outfits.length > 0 ? 'flex flex-col md:flex-row gap-8 items-start' : 'flex flex-col items-center justify-center min-h-[60vh]'}`}>
          
          <div className={`w-full transition-all duration-500 ${outfits.length > 0 ? 'md:w-1/4' : 'max-w-xl'}`}>
            <div className="text-center md:text-left mb-6">
                {!outfits.length && (
                    <>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
                        What should I wear?
                        </h2>
                        <p className="text-lg text-stone-500 mb-8">
                        Upload that one item you love but struggle to match. 
                        Our AI stylist will create casual, business, and night-out looks for you instantly.
                        </p>
                    </>
                )}
                {outfits.length > 0 && (
                     <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">Your Item</h3>
                )}
            </div>

            <ImageUploader 
              onImageSelected={handleImageSelected} 
              selectedPreview={uploadedItem?.previewUrl}
              isProcessing={isGenerating}
            />

            {!outfits.length && uploadedItem && (
                <div className="mt-8 flex justify-center">
                    <Button onClick={startStyling} disabled={isGenerating} className="w-full md:w-auto text-lg px-12 py-3">
                        {isGenerating ? 'Analyzing Wardrobe...' : 'Create My Outfits'}
                    </Button>
                </div>
            )}
            
             {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 text-center">
                  {error}
                </div>
              )}
          </div>

          {/* Results Grid */}
          {outfits.length > 0 && (
            <div className="w-full md:w-3/4 animate-fadeIn">
               <div className="flex items-end justify-between mb-6 border-b border-stone-200 pb-4">
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-stone-900">Your Wardrobe Options</h2>
                    <p className="text-stone-500 mt-1">Here are three ways to style your item.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {outfits.map((outfit) => (
                   <OutfitCard 
                     key={outfit.id} 
                     outfit={outfit} 
                     onEdit={handleEditOutfit}
                   />
                 ))}
               </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 text-center text-sm">
        <p>&copy; 2024 Virtual Stylist AI. Powered by Google Gemini 2.5 Flash Image.</p>
      </footer>
    </div>
  );
};

export default App;