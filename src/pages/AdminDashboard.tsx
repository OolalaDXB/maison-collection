import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical, LogOut, Image, Save, X } from "lucide-react";

interface PropertyRow {
  id: string;
  slug: string;
  name: string;
  location: string;
  region: string;
  country: string;
  description: string;
  long_description: string | null;
  price_per_night: number | null;
  currency: string;
  capacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  amenities: string[];
  airbnb_link: string | null;
  airbnb_rating: number | null;
  airbnb_reviews_count: number | null;
  status: string;
  tags: string[];
  hero_image: string | null;
  architect_name: string | null;
  architect_location: string | null;
  architect_year: number | null;
  architect_links: any;
  display_order: number;
}

interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  display_order: number;
  alt_text: string | null;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [editing, setEditing] = useState<PropertyRow | null>(null);
  const [managingImages, setManagingImages] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) fetchProperties();
  }, [isAdmin]);

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("display_order");
    if (error) {
      toast.error("Error loading properties");
    } else {
      setProperties((data as any[]) || []);
    }
    setLoading(false);
  };

  const fetchImages = async (propertyId: string) => {
    const { data } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .order("display_order");
    setImages((data as any[]) || []);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);

    const { id, ...rest } = editing;
    const isNew = !properties.find((p) => p.id === id);

    let error;
    if (isNew) {
      ({ error } = await supabase.from("properties").insert({ ...rest } as any));
    } else {
      ({ error } = await supabase.from("properties").update(rest as any).eq("id", id));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Saved");
      setEditing(null);
      fetchProperties();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      fetchProperties();
    }
  };

  const handleUploadImage = async (propertyId: string, file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${propertyId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(path, file);

    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("property-images")
      .getPublicUrl(path);

    const maxOrder = images.length > 0 ? Math.max(...images.map((i) => i.display_order)) + 1 : 0;

    await supabase.from("property_images").insert({
      property_id: propertyId,
      image_url: urlData.publicUrl,
      display_order: maxOrder,
    } as any);

    fetchImages(propertyId);
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    if (!confirm("Delete this image?")) return;
    // Extract path from URL
    const urlParts = imageUrl.split("/property-images/");
    if (urlParts[1]) {
      await supabase.storage.from("property-images").remove([urlParts[1]]);
    }
    await supabase.from("property_images").delete().eq("id", imageId);
    fetchImages(managingImages!);
    toast.success("Image deleted");
  };

  const handleSetHero = async (propertyId: string, imageUrl: string) => {
    await supabase.from("properties").update({ hero_image: imageUrl } as any).eq("id", propertyId);
    toast.success("Hero image updated");
    fetchProperties();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const newProperty = (): PropertyRow => ({
    id: crypto.randomUUID(),
    slug: "",
    name: "",
    location: "",
    region: "",
    country: "",
    description: "",
    long_description: null,
    price_per_night: null,
    currency: "EUR",
    capacity: null,
    bedrooms: null,
    bathrooms: null,
    area_sqm: null,
    amenities: [],
    airbnb_link: null,
    airbnb_rating: null,
    airbnb_reviews_count: null,
    status: "active",
    tags: [],
    hero_image: null,
    architect_name: null,
    architect_location: null,
    architect_year: null,
    architect_links: [],
    display_order: properties.length,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link to="/admin/profile" className="text-sm text-muted-foreground hover:text-foreground">
              {user?.user_metadata?.display_name || user?.email}
            </Link>
            <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Image manager modal */}
        {managingImages && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border border-border max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl">
                  Images — {properties.find((p) => p.id === managingImages)?.name}
                </h2>
                <button onClick={() => setManagingImages(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {images.map((img) => {
                  const prop = properties.find((p) => p.id === managingImages);
                  const isHero = prop?.hero_image === img.image_url;
                  return (
                    <div key={img.id} className="relative group border border-border">
                      <img src={img.image_url} alt={img.alt_text || ""} className="w-full h-40 object-cover" />
                      {isHero && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground">Hero</span>
                      )}
                      <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!isHero && (
                          <button
                            onClick={() => handleSetHero(managingImages, img.image_url)}
                            className="px-3 py-1 text-xs bg-primary text-primary-foreground"
                          >
                            Set as Hero
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id, img.image_url)}
                          className="px-3 py-1 text-xs bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <label className="inline-block px-4 py-2 border border-border text-sm cursor-pointer hover:border-primary transition-colors">
                {uploading ? "Uploading…" : "＋ Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(managingImages, file);
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* Editor modal */}
        {editing && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border border-border max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl">{editing.name || "New Property"}</h2>
                <button onClick={() => setEditing(null)}><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
                <Field label="Slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
                <Field label="Location" value={editing.location} onChange={(v) => setEditing({ ...editing, location: v })} />
                <Field label="Region" value={editing.region} onChange={(v) => setEditing({ ...editing, region: v })} />
                <Field label="Country" value={editing.country} onChange={(v) => setEditing({ ...editing, country: v })} />
                <Field label="Status" value={editing.status} onChange={(v) => setEditing({ ...editing, status: v })} />
                <Field label="Price/night" value={editing.price_per_night?.toString() || ""} onChange={(v) => setEditing({ ...editing, price_per_night: v ? parseInt(v) : null })} type="number" />
                <Field label="Currency" value={editing.currency} onChange={(v) => setEditing({ ...editing, currency: v })} />
                <Field label="Capacity" value={editing.capacity?.toString() || ""} onChange={(v) => setEditing({ ...editing, capacity: v ? parseInt(v) : null })} type="number" />
                <Field label="Bedrooms" value={editing.bedrooms?.toString() || ""} onChange={(v) => setEditing({ ...editing, bedrooms: v ? parseInt(v) : null })} type="number" />
                <Field label="Bathrooms" value={editing.bathrooms?.toString() || ""} onChange={(v) => setEditing({ ...editing, bathrooms: v ? parseInt(v) : null })} type="number" />
                <Field label="Area (m²)" value={editing.area_sqm?.toString() || ""} onChange={(v) => setEditing({ ...editing, area_sqm: v ? parseInt(v) : null })} type="number" />
                <Field label="Airbnb Link" value={editing.airbnb_link || ""} onChange={(v) => setEditing({ ...editing, airbnb_link: v || null })} className="md:col-span-2" />
                <Field label="Airbnb Rating" value={editing.airbnb_rating?.toString() || ""} onChange={(v) => setEditing({ ...editing, airbnb_rating: v ? parseFloat(v) : null })} type="number" />
                <Field label="Reviews Count" value={editing.airbnb_reviews_count?.toString() || ""} onChange={(v) => setEditing({ ...editing, airbnb_reviews_count: v ? parseInt(v) : null })} type="number" />
              </div>
              <div className="mt-4 space-y-4">
                <AreaField label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} />
                <AreaField label="Long Description" value={editing.long_description || ""} onChange={(v) => setEditing({ ...editing, long_description: v || null })} />
                <Field label="Amenities (comma separated)" value={editing.amenities.join(", ")} onChange={(v) => setEditing({ ...editing, amenities: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
                <Field label="Tags (comma separated)" value={editing.tags.join(", ")} onChange={(v) => setEditing({ ...editing, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-3">Architecture Credits (optional)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Architect" value={editing.architect_name || ""} onChange={(v) => setEditing({ ...editing, architect_name: v || null })} />
                  <Field label="Architect Location" value={editing.architect_location || ""} onChange={(v) => setEditing({ ...editing, architect_location: v || null })} />
                  <Field label="Year" value={editing.architect_year?.toString() || ""} onChange={(v) => setEditing({ ...editing, architect_year: v ? parseInt(v) : null })} type="number" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-primary-foreground text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={14} /> {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditing(null)} className="px-6 py-2 border border-border text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Property list */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-xl">Properties</h2>
          <button
            onClick={() => setEditing(newProperty())}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm flex items-center gap-2"
          >
            <Plus size={14} /> Add Property
          </button>
        </div>

        <div className="space-y-3">
          {properties.map((prop) => (
            <div key={prop.id} className="flex items-center gap-4 p-4 border border-border">
              <GripVertical size={16} className="text-muted-foreground" />
              {prop.hero_image && (
                <img src={prop.hero_image} alt="" className="w-16 h-12 object-cover" />
              )}
              <div className="flex-1">
                <p className="font-medium text-foreground">{prop.name}</p>
                <p className="text-sm text-muted-foreground">{prop.location} · {prop.status}</p>
              </div>
              {prop.price_per_night && (
                <span className="text-sm text-muted-foreground">€{prop.price_per_night}/night</span>
              )}
              <button
                onClick={() => {
                  setManagingImages(prop.id);
                  fetchImages(prop.id);
                }}
                className="p-2 hover:bg-secondary transition-colors"
                title="Manage images"
              >
                <Image size={16} />
              </button>
              <button onClick={() => setEditing(prop)} className="p-2 hover:bg-secondary transition-colors" title="Edit">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(prop.id)} className="p-2 hover:bg-secondary transition-colors text-destructive" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {properties.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No properties yet. Add your first one.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", className = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; className?: string;
}) => (
  <div className={className}>
    <label className="block text-xs text-muted-foreground mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
    />
  </div>
);

const AreaField = ({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) => (
  <div>
    <label className="block text-xs text-muted-foreground mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary resize-y"
    />
  </div>
);

export default AdminDashboard;
