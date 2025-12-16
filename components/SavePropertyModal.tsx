"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { PropertyInputDraft } from "@/types";

interface SavePropertyModalProps {
  draft: PropertyInputDraft;
  initialLink?: string;
  onClose: () => void;
  onSave: () => void;
}

export default function SavePropertyModal({
  draft,
  initialLink = "",
  onClose,
  onSave,
}: SavePropertyModalProps) {
  const { addProperty } = useApp();
  const [formData, setFormData] = useState({
    title: "",
    link: initialLink,
    imageUrl: "",
    images: [] as string[],
    notes: "",
  });
  const [isFetchingImages, setIsFetchingImages] = useState(false);

  // Fetch images when link is provided
  const fetchImagesFromLink = useCallback(async (url: string) => {
    if (!url || !url.startsWith("http")) return;

    setIsFetchingImages(true);
    try {
      const response = await fetch(
        `/api/fetch-property-images?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (data.images && data.images.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: data.images,
          imageUrl: data.images[0] || data.imageUrl || "", // Keep first image for backward compatibility
        }));
      } else if (data.imageUrl) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.imageUrl,
          images: [data.imageUrl],
        }));
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      // Silently fail - user can still manually add image
    } finally {
      setIsFetchingImages(false);
    }
  }, []);

  // Update link when initialLink changes and fetch images
  useEffect(() => {
    if (initialLink) {
      setFormData((prev) => ({ ...prev, link: initialLink }));
      fetchImagesFromLink(initialLink);
    }
  }, [initialLink, fetchImagesFromLink]);

  // Debounce image fetching when link changes manually
  useEffect(() => {
    if (!formData.link || !formData.link.startsWith("http")) return;

    const timeoutId = setTimeout(() => {
      fetchImagesFromLink(formData.link);
    }, 1500); // Wait 1.5 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData.link, fetchImagesFromLink]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    try {
      if (formData.link && !formData.link.startsWith("http")) {
        alert("Please enter a valid URL starting with http:// or https://");
        return;
      }
      if (formData.link) {
        new URL(formData.link);
      }
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    addProperty({
      title: formData.title || "Untitled Property",
      link: formData.link || "#",
      imageUrl: formData.images[0] || formData.imageUrl || undefined, // Backward compatibility
      images: formData.images.length > 0 ? formData.images : (formData.imageUrl ? [formData.imageUrl] : undefined),
      notes: formData.notes || undefined,
      price: draft.price,
      monthlyRent: draft.monthlyRent,
    });

    onSave();
  };

  const isFormValid = formData.title.trim() !== "" && formData.link.trim() !== "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Save Property
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Downtown Apartment"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Ad <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://..."
              required
            />
            {isFetchingImages && (
              <p className="text-xs text-gray-500 mt-1">
                🔍 Fetching images from the link...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images {formData.images.length > 0 && `(${formData.images.length} found)`}
            </label>
            {formData.images.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-2">
                  {formData.images.length} image{formData.images.length !== 1 ? "s" : ""} found from the link. You can scroll through them when viewing the property.
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {formData.images.slice(0, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ))}
                  {formData.images.length > 5 && (
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 text-xs text-gray-500">
                      +{formData.images.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value, images: e.target.value ? [e.target.value] : [] })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Auto-filled from link or paste manually"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!isFormValid}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Save Property
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

