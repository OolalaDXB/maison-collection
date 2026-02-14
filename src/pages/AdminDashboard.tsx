import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical, LogOut, Image, Save, X, MessageSquare, MapPin, RefreshCw } from "lucide-react";
import { useFxRates } from "@/hooks/useFxRates";

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
  check_in_time: string | null;
  check_out_time: string | null;
  parking_info: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  display_order: number;
  alt_text: string | null;
}

interface ReviewRow {
  id: string;
  property_id: string;
  guest_name: string;
  guest_location: string | null;
  rating: number;
  review_text: string;
  stay_date: string | null;
}

interface PoiRow {
  id: string;
  property_id: string;
  label: string;
  emoji: string;
  latitude: number;
  longitude: number;
  display_order: number;
}

const AdminDashboard = () => {
  const { rates, isLoading: fxLoading, lastUpdated, formatPrice } = useFxRates();
  const [refreshingFx, setRefreshingFx] = useState(false);
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [editing, setEditing] = useState<PropertyRow | null>(null);
  const [managingImages, setManagingImages] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

  const [managingReviews, setManagingReviews] = useState<string | null>(null);
  const [reviewsList, setReviewsList] = useState<ReviewRow[]>([]);
  const [editingReview, setEditingReview] = useState<ReviewRow | null>(null);

  const [managingPois, setManagingPois] = useState<string | null>(null);
  const [poisList, setPoisList] = useState<PoiRow[]>([]);
  const [editingPoi, setEditingPoi] = useState<PoiRow | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) fetchProperties();
  }, [isAdmin]);

  const fetchProperties = async () => {
    const { data, error } = await supabase.from("properties").select("*").order("display_order");
    if (error) toast.error("Error loading properties");
    else setProperties((data as any[]) || []);
    setLoading(false);
  };

  const fetchImages = async (propertyId: string) => {
    const { data } = await supabase.from("property_images").select("*").eq("property_id", propertyId).order("display_order");
    setImages((data as any[]) || []);
  };

  const fetchReviews = async (propertyId: string) => {
    const { data } = await supabase.from("reviews").select("*").eq("property_id", propertyId).order("stay_date", { ascending: false });
    setReviewsList((data as any[]) || []);
  };

  const fetchPois = async (propertyId: string) => {
    const { data } = await supabase.from("property_pois").select("*").eq("property_id", propertyId).order("display_order");
    setPoisList((data as any[]) || []);
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
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setEditing(null); fetchProperties(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchProperties(); }
  };

  const handleUploadImage = async (propertyId: string, file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${propertyId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("property-images").upload(path, file);
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
    const maxOrder = images.length > 0 ? Math.max(...images.map((i) => i.display_order)) + 1 : 0;
    await supabase.from("property_images").insert({ property_id: propertyId, image_url: urlData.publicUrl, display_order: maxOrder } as any);
    fetchImages(propertyId);
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    if (!confirm("Delete this image?")) return;
    const urlParts = imageUrl.split("/property-images/");
    if (urlParts[1]) await supabase.storage.from("property-images").remove([urlParts[1]]);
    await supabase.from("property_images").delete().eq("id", imageId);
    fetchImages(managingImages!);
    toast.success("Image deleted");
  };

  const handleReorderImages = async (dragId: string, dropId: string) => {
    if (dragId === dropId) return;
    const oldList = [...images];
    const dragIdx = oldList.findIndex((i) => i.id === dragId);
    const dropIdx = oldList.findIndex((i) => i.id === dropId);
    if (dragIdx < 0 || dropIdx < 0) return;
    const [moved] = oldList.splice(dragIdx, 1);
    oldList.splice(dropIdx, 0, moved);
    const reordered = oldList.map((img, idx) => ({ ...img, display_order: idx }));
    setImages(reordered);
    // Persist all display_order updates
    await Promise.all(
      reordered.map((img) =>
        supabase.from("property_images").update({ display_order: img.display_order } as any).eq("id", img.id)
      )
    );
    toast.success("Order updated");
  };

  const handleSetHero = async (propertyId: string, imageUrl: string) => {
    await supabase.from("properties").update({ hero_image: imageUrl } as any).eq("id", propertyId);
    toast.success("Hero image updated");
    fetchProperties();
  };

  const handleSaveReview = async () => {
    if (!editingReview || !managingReviews) return;
    setSaving(true);
    const { id, ...rest } = editingReview;
    const isNew = !reviewsList.find((r) => r.id === id);
    let error;
    if (isNew) ({ error } = await supabase.from("reviews").insert({ ...rest } as any));
    else ({ error } = await supabase.from("reviews").update(rest as any).eq("id", id));
    if (error) toast.error(error.message);
    else { toast.success("Review saved"); setEditingReview(null); fetchReviews(managingReviews); }
    setSaving(false);
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Review deleted"); if (managingReviews) fetchReviews(managingReviews); }
  };

  const handleSavePoi = async () => {
    if (!editingPoi || !managingPois) return;
    setSaving(true);
    const { id, ...rest } = editingPoi;
    const isNew = !poisList.find((p) => p.id === id);
    let error;
    if (isNew) ({ error } = await supabase.from("property_pois").insert({ ...rest } as any));
    else ({ error } = await supabase.from("property_pois").update(rest as any).eq("id", id));
    if (error) toast.error(error.message);
    else { toast.success("POI saved"); setEditingPoi(null); fetchPois(managingPois); }
    setSaving(false);
  };

  const handleDeletePoi = async (id: string) => {
    if (!confirm("Delete this POI?")) return;
    const { error } = await supabase.from("property_pois").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("POI deleted"); if (managingPois) fetchPois(managingPois); }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const newProperty = (): PropertyRow => ({
    id: crypto.randomUUID(), slug: "", name: "", location: "", region: "", country: "",
    description: "", long_description: null, price_per_night: null, currency: "EUR",
    capacity: null, bedrooms: null, bathrooms: null, area_sqm: null, amenities: [],
    airbnb_link: null, airbnb_rating: null, airbnb_reviews_count: null, status: "active",
    tags: [], hero_image: null, architect_name: null, architect_location: null,
    architect_year: null, architect_links: [], display_order: properties.length,
    check_in_time: "15:00", check_out_time: "11:00",
    parking_info: "Free parking in front of building (non-reserved)",
    latitude: null, longitude: null,
  });

  const newReview = (propertyId: string): ReviewRow => ({
    id: crypto.randomUUID(), property_id: propertyId, guest_name: "",
    guest_location: null, rating: 5, review_text: "", stay_date: null,
  });

  const newPoi = (propertyId: string): PoiRow => ({
    id: crypto.randomUUID(), property_id: propertyId, label: "", emoji: "📍",
    latitude: 0, longitude: 0, display_order: poisList.length,
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
        {/* POIs manager modal */}
        {managingPois && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border border-border max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl">
                  POIs — {properties.find((p) => p.id === managingPois)?.name}
                </h2>
                <button onClick={() => { setManagingPois(null); setEditingPoi(null); }}>
                  <X size={20} />
                </button>
              </div>

              {editingPoi && (
                <div className="border border-border p-6 mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Field label="Label" value={editingPoi.label} onChange={(v) => setEditingPoi({ ...editingPoi, label: v })} />
                    <Field label="Emoji" value={editingPoi.emoji} onChange={(v) => setEditingPoi({ ...editingPoi, emoji: v })} />
                    <Field label="Latitude" value={editingPoi.latitude.toString()} onChange={(v) => setEditingPoi({ ...editingPoi, latitude: parseFloat(v) || 0 })} type="number" />
                    <Field label="Longitude" value={editingPoi.longitude.toString()} onChange={(v) => setEditingPoi({ ...editingPoi, longitude: parseFloat(v) || 0 })} type="number" />
                  </div>
                  <Field label="Display Order" value={editingPoi.display_order.toString()} onChange={(v) => setEditingPoi({ ...editingPoi, display_order: parseInt(v) || 0 })} type="number" />
                  <div className="flex gap-3">
                    <button onClick={handleSavePoi} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground text-sm flex items-center gap-2">
                      <Save size={14} /> {saving ? "Saving…" : "Save POI"}
                    </button>
                    <button onClick={() => setEditingPoi(null)} className="px-4 py-2 border border-border text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {poisList.map((poi) => (
                  <div key={poi.id} className="flex items-center gap-4 p-4 border border-border">
                    <span className="text-lg">{poi.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{poi.label}</p>
                      <p className="text-xs text-muted-foreground">{poi.latitude}, {poi.longitude}</p>
                    </div>
                    <button onClick={() => setEditingPoi(poi)} className="p-2 hover:bg-secondary transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeletePoi(poi.id)} className="p-2 hover:bg-secondary transition-colors text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {poisList.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No POIs yet.</p>
                )}
              </div>

              <button
                onClick={() => setEditingPoi(newPoi(managingPois))}
                className="px-4 py-2 border border-border text-sm flex items-center gap-2 hover:border-primary transition-colors"
              >
                <Plus size={14} /> Add POI
              </button>
            </div>
          </div>
        )}

        {/* Reviews manager modal */}
        {managingReviews && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border border-border max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl">
                  Reviews — {properties.find((p) => p.id === managingReviews)?.name}
                </h2>
                <button onClick={() => { setManagingReviews(null); setEditingReview(null); }}>
                  <X size={20} />
                </button>
              </div>

              {editingReview && (
                <div className="border border-border p-6 mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Guest Name" value={editingReview.guest_name} onChange={(v) => setEditingReview({ ...editingReview, guest_name: v })} />
                    <Field label="Guest Location" value={editingReview.guest_location || ""} onChange={(v) => setEditingReview({ ...editingReview, guest_location: v || null })} />
                    <Field label="Stay Date" value={editingReview.stay_date || ""} onChange={(v) => setEditingReview({ ...editingReview, stay_date: v || null })} type="date" />
                  </div>
                  <Field label="Rating (1-5)" value={editingReview.rating.toString()} onChange={(v) => setEditingReview({ ...editingReview, rating: Math.min(5, Math.max(1, parseInt(v) || 5)) })} type="number" />
                  <AreaField label="Review Text" value={editingReview.review_text} onChange={(v) => setEditingReview({ ...editingReview, review_text: v })} />
                  <div className="flex gap-3">
                    <button onClick={handleSaveReview} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground text-sm flex items-center gap-2">
                      <Save size={14} /> {saving ? "Saving…" : "Save Review"}
                    </button>
                    <button onClick={() => setEditingReview(null)} className="px-4 py-2 border border-border text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {reviewsList.map((review) => (
                  <div key={review.id} className="flex items-start gap-4 p-4 border border-border">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {review.guest_name}
                        {review.guest_location && <span className="text-muted-foreground font-normal"> — {review.guest_location}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{review.review_text}</p>
                      <p className="text-xs text-muted-foreground mt-1">★{review.rating} · {review.stay_date || "No date"}</p>
                    </div>
                    <button onClick={() => setEditingReview(review)} className="p-2 hover:bg-secondary transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteReview(review.id)} className="p-2 hover:bg-secondary transition-colors text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {reviewsList.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No reviews yet.</p>
                )}
              </div>

              <button
                onClick={() => setEditingReview(newReview(managingReviews))}
                className="px-4 py-2 border border-border text-sm flex items-center gap-2 hover:border-primary transition-colors"
              >
                <Plus size={14} /> Add Review
              </button>
            </div>
          </div>
        )}

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
                  const isDragging = draggedImageId === img.id;
                  return (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => setDraggedImageId(img.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => { if (draggedImageId) handleReorderImages(draggedImageId, img.id); setDraggedImageId(null); }}
                      onDragEnd={() => setDraggedImageId(null)}
                      className={`relative group border border-border cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? "opacity-40" : ""}`}
                    >
                      <img src={img.image_url} alt={img.alt_text || ""} className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className="px-1.5 py-0.5 text-[10px] bg-background/80 text-muted-foreground border border-border">{img.display_order + 1}</span>
                      </div>
                      {isHero && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground">Hero</span>
                      )}
                      <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!isHero && (
                          <button onClick={() => handleSetHero(managingImages, img.image_url)} className="px-3 py-1 text-xs bg-primary text-primary-foreground">
                            Set as Hero
                          </button>
                        )}
                        <button onClick={() => handleDeleteImage(img.id, img.image_url)} className="px-3 py-1 text-xs bg-destructive text-destructive-foreground">
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <label className="inline-block px-4 py-2 border border-border text-sm cursor-pointer hover:border-primary transition-colors">
                {uploading ? "Uploading…" : "＋ Upload Image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUploadImage(managingImages, file); }} />
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
                <p className="text-sm text-muted-foreground mb-3">Practical Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Check-in Time" value={editing.check_in_time || "15:00"} onChange={(v) => setEditing({ ...editing, check_in_time: v })} />
                  <Field label="Check-out Time" value={editing.check_out_time || "11:00"} onChange={(v) => setEditing({ ...editing, check_out_time: v })} />
                  <Field label="Parking Info" value={editing.parking_info || ""} onChange={(v) => setEditing({ ...editing, parking_info: v || null })} className="md:col-span-2" />
                </div>
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-3">Map Location</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Latitude" value={editing.latitude?.toString() || ""} onChange={(v) => setEditing({ ...editing, latitude: v ? parseFloat(v) : null })} type="number" />
                  <Field label="Longitude" value={editing.longitude?.toString() || ""} onChange={(v) => setEditing({ ...editing, longitude: v ? parseFloat(v) : null })} type="number" />
                </div>
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
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary text-primary-foreground text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                  <Save size={14} /> {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditing(null)} className="px-6 py-2 border border-border text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Property list */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-xl">Properties</h2>
          <button onClick={() => setEditing(newProperty())} className="px-4 py-2 bg-primary text-primary-foreground text-sm flex items-center gap-2">
            <Plus size={14} /> Add Property
          </button>
        </div>

        <div className="space-y-3">
          {properties.map((prop) => (
            <div key={prop.id} className="flex items-center gap-4 p-4 border border-border">
              <GripVertical size={16} className="text-muted-foreground" />
              {prop.hero_image && <img src={prop.hero_image} alt="" className="w-16 h-12 object-cover" />}
              <div className="flex-1">
                <p className="font-medium text-foreground">{prop.name}</p>
                <p className="text-sm text-muted-foreground">{prop.location} · {prop.status}</p>
              </div>
              {prop.price_per_night && <span className="text-sm text-muted-foreground">€{prop.price_per_night}/night</span>}
              <button onClick={() => { setManagingPois(prop.id); fetchPois(prop.id); }} className="p-2 hover:bg-secondary transition-colors" title="Manage POIs">
                <MapPin size={16} />
              </button>
              <button onClick={() => { setManagingReviews(prop.id); fetchReviews(prop.id); }} className="p-2 hover:bg-secondary transition-colors" title="Manage reviews">
                <MessageSquare size={16} />
              </button>
              <button onClick={() => { setManagingImages(prop.id); fetchImages(prop.id); }} className="p-2 hover:bg-secondary transition-colors" title="Manage images">
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

        {/* Exchange Rates */}
        <div className="mt-16 border-t border-border pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl">Exchange Rates</h2>
            <button
              onClick={async () => {
                setRefreshingFx(true);
                try {
                  const { data, error } = await supabase.functions.invoke("refresh-fx-rates");
                  if (error) throw error;
                  toast.success(`Rates refreshed — ${data?.updated || 0} updated`);
                  // Invalidate react-query cache
                  window.location.reload();
                } catch (e: any) {
                  toast.error(e.message || "Failed to refresh rates");
                } finally {
                  setRefreshingFx(false);
                }
              }}
              disabled={refreshingFx}
              className="px-4 py-2 border border-border text-sm flex items-center gap-2 hover:border-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshingFx ? "animate-spin" : ""} />
              {refreshingFx ? "Refreshing…" : "Refresh Now"}
            </button>
          </div>

          {fxLoading ? (
            <p className="text-muted-foreground text-sm">Loading rates…</p>
          ) : rates.length === 0 ? (
            <p className="text-muted-foreground text-sm">No rates yet. Click "Refresh Now" to fetch from ECB.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {rates.map((r) => (
                  <div key={r.target_currency} className="border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">EUR → {r.target_currency}</p>
                    <p className="text-lg font-display text-foreground">{r.rate.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      1€ = {formatPrice(Math.round(r.rate * 100) / 100, r.target_currency)}
                    </p>
                  </div>
                ))}
              </div>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </>
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
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary" />
  </div>
);

const AreaField = ({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) => (
  <div>
    <label className="block text-xs text-muted-foreground mb-1">{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
      className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary resize-y" />
  </div>
);

export default AdminDashboard;
