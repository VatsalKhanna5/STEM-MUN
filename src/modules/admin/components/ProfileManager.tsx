"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, User, Loader2 } from "lucide-react";

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
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");

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

    const newProfile = {
      name,
      description,
      image_url: imageUrl || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(name)}`,
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
    } else {
      console.error("Error adding profile:", error);
    }
    setAdding(false);
  }

  async function handleDeleteProfile(id: string) {
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
    setTags("");
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" />
        <span className="uppercase tracking-widest text-xs">Syncing profiles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight uppercase">Participant Registry</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
        >
          {isAdding ? <Plus className="rotate-45" size={14} /> : <Plus size={14} />}
          <span>{isAdding ? "Cancel" : "Add Profile"}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddProfile} className="p-6 border border-white/20 rounded-lg bg-white/5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest">FullName</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sam Altman"
                className="w-full bg-black border border-white/20 p-2 rounded focus:border-white outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest">Image URL (Optional)</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black border border-white/20 p-2 rounded focus:border-white outline-none transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief bio..."
              className="w-full bg-black border border-white/20 p-2 rounded focus:border-white outline-none transition-colors h-20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI, Tech, Business"
              className="w-full bg-black border border-white/20 p-2 rounded focus:border-white outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-white text-black font-bold p-3 rounded-md uppercase tracking-widest text-xs hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {adding ? "Adding..." : success ? "Admission Confirmed" : "Confirm Admission"}
          </button>
        </form>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="group relative flex items-center space-x-4 p-4 border border-white/10 rounded-lg hover:border-white/30 transition-all bg-white/5">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-white/20 grayscale group-hover:grayscale-0 transition-all">
              <img 
                src={profile.image_url} 
                alt={profile.name} 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x400.png?text=Profile")}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate tracking-tight">{profile.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-1">{profile.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleDeleteProfile(profile.id)}
              className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              title="Remove profile"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {profiles.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-lg">
            <User size={32} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 uppercase tracking-widest text-xs italic">No participants registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
