"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, User, Loader2, Image as ImageIcon, Search, CheckCircle2, ShieldAlert, Fingerprint, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/cards/GlassCard";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tags: string[];
}

export default function ProfileManager() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);
  const [adding, setAdding] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  }

  async function handleAddProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setAdding(true);
    setSuccess(false);

    let finalImageUrl = imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=131313`;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        setError("Error uploading image: " + uploadError.message);
        setAdding(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      finalImageUrl = publicUrlData.publicUrl;
    }

    const newProfile = {
      name,
      description,
      image_url: finalImageUrl,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert([newProfile])
      .select();

    if (!error && data) {
      setProfiles([data[0], ...profiles]);
      setSuccess(true);
      setTimeout(() => {
        setIsAdding(false);
        setSuccess(false);
        resetForm();
      }, 1000);
    }
    setAdding(false);
  }

  async function handleDeleteProfile(id: string) {
    if(!confirm("Remove this delegate?")) return;
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (!error) {
      setProfiles(profiles.filter(p => p.id !== id));
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setImageUrl("");
    setImageFile(null);
    setTags("");
    setError("");
  }

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-8">
        <div className="w-12 h-12 border-2 border-white/5 border-t-secondary rounded-full animate-spin shadow-luxury" />
        <span className="font-display text-secondary text-[8px] uppercase font-black tracking-widest animate-pulse">Loading Delegates</span>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-border/10 pb-10">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <Database className="w-3 h-3 text-secondary/40" />
              <span className="font-display text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest italic leading-none">Delegate Management</span>
           </div>
           <h2 className="font-display text-5xl font-bold tracking-tighter uppercase italic leading-none text-foreground">DELEGATES</h2>
        </div>
        <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" size={18} />
                <input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-card/40 border border-border/10 rounded-2xl py-5 pl-16 pr-8 text-[11px] font-bold uppercase tracking-widest outline-none focus:bg-card focus:border-foreground/20 transition-all placeholder:text-muted-foreground/10"
                   placeholder="SEARCH DELEGATES..."
                />
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-4 bg-foreground text-background px-12 py-5 rounded-2xl font-display font-black text-[11px] uppercase tracking-widest hover:scale-105 active-scale transition-all shadow-luxury"
            >
              <div className={cn("transition-transform duration-700", isAdding && "rotate-45")}>
                 <Plus size={18} />
              </div>
              <span className="leading-none">{isAdding ? "CANCEL" : "ADD DELEGATE"}</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5"
              >
                <GlassCard variant="glass" className="space-y-10 p-12 animate-fade-in group">
                  <header className="flex items-center justify-between border-b border-border/10 pb-8">
                    <div className="flex items-center gap-4">
                      <Fingerprint size={18} className="text-secondary/40 group-hover:text-secondary group-hover:scale-110 transition-all duration-700" />
                      <h3 className="font-display text-[10px] uppercase font-black tracking-[0.3em] italic text-foreground">NEW DELEGATE</h3>
                    </div>
                  </header>

                  <form onSubmit={handleAddProfile} className="space-y-10">
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <label className="font-display text-[9px] text-muted-foreground/40 uppercase font-black italic tracking-widest">NAME</label>
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="JOHN DOE"
                          className="w-full bg-card-elevated/50 border border-border/10 p-6 rounded-xl text-[12px] uppercase tracking-widest focus:border-foreground/20 outline-none transition-all placeholder:text-muted-foreground/5 font-bold font-display"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="font-display text-[9px] text-muted-foreground/40 uppercase font-black italic tracking-widest">DELEGATE AVATAR</label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                          {imageUrl || imageFile ? (
                            <img 
                              src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                              alt="Preview" 
                              className="w-16 h-16 rounded-full object-cover border border-border/10 shadow-luxury grayscale" 
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-card-elevated/50 flex items-center justify-center border border-border/10 shadow-luxury">
                              <ImageIcon className="text-muted-foreground/20" size={24} />
                            </div>
                          )}
                          <div className="flex-1 w-full">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setImageFile(e.target.files[0]);
                                  setImageUrl("");
                                }
                              }}
                              className="w-full bg-card-elevated/50 border border-border/10 p-3 rounded-xl text-[12px] focus:border-foreground/20 outline-none transition-all font-display file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-foreground file:text-background hover:file:scale-105 file:transition-transform file:cursor-pointer cursor-pointer font-bold text-muted-foreground/60"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="font-display text-[9px] text-muted-foreground/40 uppercase font-black italic tracking-widest">DESCRIPTION</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="ENTER DESCRIPTION..."
                          className="w-full bg-card-elevated/50 border border-border/10 p-8 rounded-xl text-[12px] uppercase tracking-widest focus:border-foreground/20 outline-none transition-all h-48 resize-none placeholder:text-muted-foreground/5 font-bold font-display leading-loose"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="font-display text-[9px] text-muted-foreground/40 uppercase font-black italic tracking-widest">TAGS (COMMA SEPARATED)</label>
                        <input
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="DELEGATE, CHAIR, AI..."
                          className="w-full bg-card-elevated/50 border border-border/10 p-6 rounded-xl text-[12px] uppercase tracking-widest focus:border-foreground/20 outline-none transition-all placeholder:text-muted-foreground/5 font-bold font-display"
                        />
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {error && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-destructive text-[9px] uppercase font-black text-center tracking-[0.4em] italic mt-4"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={adding}
                      className="w-full bg-foreground text-background font-display font-black p-8 rounded-2xl uppercase tracking-widest text-[11px] hover:scale-[0.98] active-scale transition-all disabled:opacity-50 flex items-center justify-center gap-6 shadow-luxury"
                    >
                      {adding ? <Loader2 className="animate-spin" size={18} /> : success ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                      <span className="leading-none">{adding ? "SAVING..." : success ? "SAVED" : "SAVE DELEGATE"}</span>
                    </button>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={cn(
            "space-y-6",
            isAdding ? "lg:col-span-7" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 space-y-0"
          )}>
            {filteredProfiles.map((p) => (
              <GlassCard
                key={p.id}
                variant="elevated"
                hover
                className="group flex flex-col p-10 border-border/5 hover:border-foreground/10 transition-all duration-1000 relative overflow-hidden active-scale shadow-luxury"
              >
                <div className="flex items-center gap-10 relative z-10">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-border/10 shadow-luxury group-hover:scale-105 transition-transform duration-700">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-display font-bold text-2xl uppercase italic tracking-tighter leading-none group-hover:text-secondary transition-colors truncate text-foreground">{p.name}</h3>
                    <p className="font-display text-muted-foreground/40 text-[9px] uppercase font-black italic tracking-widest">ID: {p.id.slice(0,12)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProfile(p.id)}
                    className="p-4 text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all active-scale"
                  >
                    <ShieldAlert size={20} />
                  </button>
                </div>
                
                <p className="mt-10 text-muted-foreground/60 text-[11px] uppercase font-medium italic line-clamp-2 leading-relaxed h-[3.5rem] tracking-tight">
                  {p.description}
                </p>
                
                <div className="flex flex-wrap gap-4 mt-10 pt-10 border-t border-border/10 relative z-10">
                  {p.tags.map(tag => (
                    <span key={tag} className="font-display text-[8px] border border-border/20 text-muted-foreground/40 px-5 py-2 rounded-full font-black italic group-hover:border-secondary/20 group-hover:text-secondary transition-all uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                  <div className="ml-auto w-2 h-2 rounded-full bg-secondary pulse-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </GlassCard>
            ))}

            {filteredProfiles.length === 0 && !isAdding && (
              <div className="col-span-full py-48 text-center bg-card/30 border border-dashed border-border/10 rounded-[3rem] flex flex-col items-center justify-center gap-12 shadow-luxury outline-none">
                <Database size={64} className="text-muted-foreground/10 animate-pulse" />
                <div className="space-y-4">
                  <p className="font-display text-muted-foreground/20 text-[11px] font-black italic uppercase tracking-[0.4em]">NO DELEGATES FOUND</p>
                  <p className="font-display text-muted-foreground/5 text-[9px] uppercase italic tracking-[0.2em] font-bold">No delegates have been added yet.</p>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
