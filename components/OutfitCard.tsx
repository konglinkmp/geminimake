import React, { useState } from 'react';
import { GeneratedOutfit } from '../types';
import { Button } from './Button';

interface OutfitCardProps {
  outfit: GeneratedOutfit;
  onEdit: (id: string, prompt: string) => Promise<void>;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;

    setIsProcessingEdit(true);
    await onEdit(outfit.id, editPrompt);
    setIsProcessingEdit(false);
    setIsEditing(false);
    setEditPrompt('');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = outfit.imageUrl;
    link.download = `stylist-${outfit.style.toLowerCase().replace(' ', '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (outfit.isLoading) {
    return (
      <div className="w-full aspect-[3/4] rounded-xl bg-stone-100 animate-pulse flex flex-col items-center justify-center p-6 border border-stone-200">
        <div className="w-12 h-12 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4"></div>
        <p className="text-stone-500 font-serif">Designing {outfit.style}...</p>
      </div>
    );
  }

  return (
    <div className="group relative w-full rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-stone-100">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-50">
        <img 
          src={outfit.imageUrl} 
          alt={`${outfit.style} Outfit`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
           <div className="flex gap-2 justify-center">
             <button 
               onClick={handleDownload}
               className="bg-white text-stone-900 p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
               title="Download"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
             </button>
             <button 
               onClick={() => setIsEditing(true)}
               className="bg-stone-900 text-white p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
               title="Edit with AI"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l2.846-.813a11.12 11.12 0 006.374-6.374l.353-.966a6.978 6.978 0 01-1.802-1.802l-.966.353a11.12 11.12 0 00-6.374 6.374zm-9.105-4.2l6.182-6.182a5.5 5.5 0 001.559-2.285 6.63 6.63 0 00-4.006 4.005l-3.735 4.463z" />
                </svg>
             </button>
           </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">{outfit.style}</h3>
        <p className="text-sm text-stone-500">Curated by Gemini</p>

        {/* Edit Mode */}
        {isEditing && (
          <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200 animate-fadeIn">
            <form onSubmit={handleEditSubmit}>
              <label className="block text-xs font-bold text-stone-600 mb-2">
                REFINE THIS LOOK
              </label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g. Change shoes to sneakers, add a red scarf..."
                className="w-full text-sm p-2 border border-stone-300 rounded-md mb-2 focus:ring-1 focus:ring-stone-500 outline-none resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1"
                >
                  Cancel
                </button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="text-xs px-3 py-1"
                  isLoading={isProcessingEdit}
                >
                  Generate
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};