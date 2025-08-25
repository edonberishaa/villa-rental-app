import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../components/Toast";
import { getVillaById } from "../services/villaService";
import { getReservationsForOwnedVilla } from "../services/reservationService";
import { ASSET_BASE_URL } from "../config";
import type { Villa } from "../types/Villa";
import api from "../services/api";

const OwnerVillaDetailsPage: React.FC = () => {
  const { villaId } = useParams<{ villaId: string }>();
  const { push } = useToast();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Villa>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);

  // Fetch villa
  useEffect(() => {
    const fetchVilla = async () => {
      if (!villaId) return;
      try {
        const data = await getVillaById(Number(villaId));
        setVilla(data);
        setForm(data);
      } catch {
        setError("Villa not found");
      } finally {
        setLoading(false);
      }
    };
    fetchVilla();
  }, [villaId]);

  // Fetch reservations
  useEffect(() => {
    if (!villaId) return;
    setReservationsLoading(true);
    getReservationsForOwnedVilla(Number(villaId))
      .then(setReservations)
      .finally(() => setReservationsLoading(false));
  }, [villaId]);

  // Parse images
  const images: string[] = useMemo(() => {
    try {
      return villa?.imageUrlsJson ? JSON.parse(villa.imageUrlsJson) : [];
    } catch {
      return [];
    }
  }, [villa?.imageUrlsJson]);

  // Parse amenities
  const amenities: string[] = useMemo(() => {
    try {
      return villa?.amenitiesJson ? JSON.parse(villa.amenitiesJson) : [];
    } catch {
      return [];
    }
  }, [villa?.amenitiesJson]);

  const formAmenities: string[] = useMemo(() => {
    try {
      return form.amenitiesJson ? JSON.parse(form.amenitiesJson) : [];
    } catch {
      return [];
    }
  }, [form.amenitiesJson]);

  const fullImageUrl = (img: string) =>
    img.startsWith("http") ? img : `${ASSET_BASE_URL}${img}`;

  const prevImage = () =>
    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);

  const nextImage = () =>
    setCurrentImageIndex((i) => (i + 1) % images.length);

  // Format date → Albanian
  const formatDateSq = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("sq-AL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Edit handlers
  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm(villa!);
    setNewFiles(null);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleAddImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFiles(e.target.files);
  };
  const handleSave = async () => {
    try {
      // Always send all required fields, merging villa and form (form takes precedence)
      if (!villa) return;
      const payload = {
        ...villa,
        ...form,
        // Ensure required fields are present and not empty
        name: form.name ?? villa.name ?? "",
        region: form.region ?? villa.region ?? "",
        phoneNumber: form.phoneNumber ?? villa.phoneNumber ?? "",
        pricePerNight: form.pricePerNight ?? villa.pricePerNight ?? 0,
        amenitiesJson: form.amenitiesJson ?? villa.amenitiesJson ?? "[]",
        description: form.description ?? villa.description ?? "",
        address: form.address ?? villa.address ?? "",
        latitude: form.latitude ?? villa.latitude ?? null,
        longitude: form.longitude ?? villa.longitude ?? null,
        imageUrlsJson: villa.imageUrlsJson, // don't let this get lost
        id: villa.id,
      };
      await api.put(`/owner/properties/${villaId}`, payload);
      if (newFiles && newFiles.length > 0) {
        const formData = new FormData();
        Array.from(newFiles).forEach((f) => formData.append("files", f));
        await api.post(`/owner/properties/${villaId}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      push("Saved changes!", "success");
      setEditMode(false);
      setNewFiles(null);
      const updated = await getVillaById(Number(villaId));
      setVilla(updated);
      setForm(updated);
    } catch (e: any) {
      push(e?.response?.data?.message || "Save failed.", "error");
    }
  };

  const handleAddAmenity = () => {
    setForm((f) => ({
      ...f,
      amenitiesJson: JSON.stringify([...(formAmenities || []), ""]),
    }));
  };
  const handleRemoveAmenity = (index: number) => {
    setForm((f) => ({
      ...f,
      amenitiesJson: JSON.stringify(
        formAmenities.filter((_, i) => i !== index)
      ),
    }));
  };
  const handleAmenityChange = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      amenitiesJson: JSON.stringify(
        formAmenities.map((a, i) => (i === index ? value : a))
      ),
    }));
  };

  if (loading) return <p className="p-4 text-center">Loading...</p>;
  if (error || !villa)
    return <p className="p-4 text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{villa.name}</h1>
        {villa.address && (
          <p className="text-sm text-gray-600 mt-1">{villa.address}</p>
        )}
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div className="relative rounded-lg overflow-hidden max-h-[450px]">
          <img
            src={fullImageUrl(images[currentImageIndex])}
            alt={`Villa ${currentImageIndex + 1}`}
            className="w-full h-[450px] object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-2 rounded-full shadow"
              >
                ◀
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-2 rounded-full shadow"
              >
                ▶
              </button>
            </>
          )}
        </div>
      )}

      {/* Villa Info */}
      {editMode ? (
        <div className="space-y-3 mb-6">
          <input
            className="input"
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            className="input"
            name="region"
            value={form.region || ""}
            onChange={handleChange}
            placeholder="Region"
          />
          <input
            className="input"
            name="phoneNumber"
            value={form.phoneNumber || ""}
            onChange={handleChange}
            placeholder="Owner phone number"
          />
          <textarea
            className="input"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Description"
          />
          <input
            className="input"
            name="pricePerNight"
            type="number"
            value={form.pricePerNight || ""}
            onChange={handleChange}
            placeholder="Price per night"
          />
          <div>
            <div className="font-semibold mb-1">Images</div>
            <input
              className="input"
              type="file"
              multiple
              onChange={handleAddImageFiles}
            />
            {newFiles && (
              <div className="text-xs text-neutral-500">
                {newFiles.length} file(s) selected
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold mb-1">Amenities</div>
            {(formAmenities || []).map((a, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  className="input flex-1"
                  value={a}
                  onChange={(e) => handleAmenityChange(i, e.target.value)}
                  placeholder="Amenity"
                />
                <button className="btn" onClick={() => handleRemoveAmenity(i)}>
                  -
                </button>
              </div>
            ))}
            <button className="btn" onClick={handleAddAmenity}>
              Add Amenity
            </button>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={handleSave}>
              Save
            </button>
            <button className="btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700 mb-4">{villa.description}</p>
          <p className="text-xl font-semibold text-green-600 mb-6">
            €{villa.pricePerNight} / night
          </p>
          <div className="mb-2 text-sm text-neutral-700">
            <b>Owner phone:</b> {villa.phoneNumber}
          </div>
          <button className="btn mb-4" onClick={handleEdit}>
            Edit Villa
          </button>
          <div className="mb-4">
            <div className="font-semibold mb-1">Amenities</div>
            <ul className="list-disc ml-5 text-sm">
              {(amenities || []).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Reservations */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Rezervimet</h3>
        {reservationsLoading ? (
          <p>Duke u ngarkuar rezervimet...</p>
        ) : reservations.length === 0 ? (
          <p className="text-gray-500">Nuk ka ende rezervime.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Mysafiri</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Telefoni</th>
                  <th className="p-3 text-left">Datat</th>
                  <th className="p-3 text-left">Statusi</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{r.guestName || "—"}</td>
                    <td className="p-3">{r.guestEmail || "—"}</td>
                    <td className="p-3">{r.guestPhone || "—"}</td>
                    <td className="p-3">
                      {formatDateSq(r.startDate)} → {formatDateSq(r.endDate)}
                    </td>
                    <td className="p-3">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerVillaDetailsPage;
