"use client";

import { Property } from "@/types/Properties";
import { Plus, Trash2, X, Upload, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

// interface CloudinaryUploadResponse {
//   secure_url: string;
//   public_id: string;
// }

const PropertyModal = ({
  mode,
  property,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit" | "view";
  property: Property | null;
  onClose: () => void;
  onSubmit: (data: Partial<Property>) => void;
}) => {
  const [formData, setFormData] = useState<Partial<Property>>(() => ({
    title: property?.title || "",
    type: property?.type || "house",
    category: property?.category || "sale",
    price: property?.price || 0,
    bedrooms: property?.type === "house" ? property?.bedrooms || 1 : 0,
    bathrooms: property?.type === "house" ? property?.bathrooms || 1 : 0,
    area: property?.area || 0,
    location: property?.location || "",
    featured: property?.featured || false,
    description: property?.description || "",
    features: property?.features || [],
    image: property?.image || "",
    images: property?.images || [],
    roomTypes: property?.roomTypes || [],
  }));

  const [newFeature, setNewFeature] = useState("");
  const [newRoomType, setNewRoomType] = useState("");
  const [uploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = mode === "view";
  const title =
    mode === "create"
      ? "Add New Property"
      : mode === "edit"
      ? "Edit Property"
      : "Property Details";

  // const uploadToCloudinary = async (file: File): Promise<string> => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append(
  //     "upload_preset",
  //     process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "your_upload_preset"
  //   );

  //   try {
  //     const response = await fetch(
  //       `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
  //       {
  //         method: "POST",
  //         body: formData,
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Upload failed");
  //     }

  //     const data: CloudinaryUploadResponse = await response.json();
  //     return data.secure_url;
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     throw new Error("Failed to upload image");
  //   }
  // };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadOnly) {
      onSubmit(formData);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const setAsMainImage = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const addRoomType = () => {
    if (newRoomType.trim()) {
      setFormData((prev) => ({
        ...prev,
        roomTypes: [...(prev.roomTypes || []), newRoomType.trim()],
      }));
      setNewRoomType("");
    }
  };

  const removeRoomType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6 hover:text-red-700 cursor-pointer" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as "house" | "plot",
                    bedrooms:
                      e.target.value === "plot"
                        ? undefined
                        : prev.bedrooms || 1,
                    bathrooms:
                      e.target.value === "plot"
                        ? undefined
                        : prev.bathrooms || 1,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none"
                disabled={isReadOnly}
              >
                <option value="house">House</option>
                <option value="plot">Plot</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as "sale" | "rent",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none"
                disabled={isReadOnly}
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Price (RWF) *
              </label>
              <input
                type="number"
                value={formData.price === 0 ? "" : formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Area (m²) *
              </label>
              <input
                type="number"
                value={formData.area === 0 ? "" : formData.area}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    area: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
                readOnly={isReadOnly}
              />
            </div>

            {formData.type === "house" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms === 0 ? "" : formData.bedrooms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bedrooms: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                    required
                    readOnly={isReadOnly}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms === 0 ? "" : formData.bathrooms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bathrooms: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                    readOnly={isReadOnly}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none"
              required
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Upload Images *
            </label>

            {formData.image && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Main Image
                </label>
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <Image
                    src={formData.image}
                    alt="Main property image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {!isReadOnly && (
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  // onChange={imageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-light-blue to-blue-800 text-white rounded-sm hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Images
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  Upload multiple images (JPEG, PNG, WebP)
                </p>
              </div>
            )}

            {formData.images?.length && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Image Gallery ({formData.images?.length} images)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images?.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`Property image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {url === formData.image && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            Main
                          </div>
                        )}
                      </div>

                      {!isReadOnly && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {url !== formData.image && (
                            <button
                              type="button"
                              onClick={() => setAsMainImage(url)}
                              className="p-1 bg-white rounded hover:bg-gray-100"
                              title="Set as main image"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1 bg-white rounded hover:bg-gray-100 text-red-600"
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Features
            </label>
            <div className="space-y-2">
              {formData.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {feature}
                  </span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-light-blue text-white rounded-lg hover:bg-blue-800 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Room Types
            </label>
            <div className="space-y-2">
              {formData.roomTypes?.map((roomType, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {roomType}
                  </span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeRoomType(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    placeholder="Add room type..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring focus:ring-light-blue text-black focus:border-transparent outline-none"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addRoomType())
                    }
                  />
                  <button
                    type="button"
                    onClick={addRoomType}
                    className="px-4 py-2 bg-light-blue text-white rounded-lg hover:bg-blue-800 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, featured: e.target.checked }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              disabled={isReadOnly}
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium text-gray-700"
            >
              Featured Property
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-50 rounded-sm border-2 border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {isReadOnly ? "Close" : "Cancel"}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-light-blue to-blue-800 text-white font-medium rounded-sm hover:shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={uploading || !formData.image}
              >
                {mode === "create" ? "Create" : "Update"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;
