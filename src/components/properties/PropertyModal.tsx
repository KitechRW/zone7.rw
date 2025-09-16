import {
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Camera,
  Star,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  CreatePropertyFormData,
  Property,
  RoomTypeImageUpload,
} from "@/types/Properties";

const ROOM_TYPES = [
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "dining_room", label: "Dining Room" },
  { value: "balcony", label: "Balcony" },
  { value: "exterior", label: "Exterior" },
  { value: "other", label: "Other" },
];

// Interface for room image preview
interface RoomTypeImagePreview {
  file: File;
  preview: string;
  roomType: string;
  description: string;
  isExisting?: boolean;
  originalUrl?: string;
}

interface PropertyModalProps {
  mode: "create" | "edit" | "view";
  property: Property | null;
  onClose: () => void;
  onSubmit: (data: Partial<CreatePropertyFormData>) => void;
}

const PropertyModal: React.FC<PropertyModalProps> = ({
  mode,
  property,
  onClose,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(() => ({
    title: property?.title || "",
    type: property?.type || ("house" as "house" | "plot"),
    category: property?.category || ("sale" as "sale" | "rent"),
    price: property?.price || 0,
    bedrooms: property?.type === "house" ? property?.bedrooms || 1 : 0,
    bathrooms: property?.type === "house" ? property?.bathrooms || 1 : 0,
    area: property?.area || 0,
    location: property?.location || "",
    featured: property?.featured || false,
    description: property?.description || "",
    features: property?.features || [],
  }));

  const [newFeature, setNewFeature] = useState("");

  const [mainImage, setMainImage] = useState<{
    file: File | null;
    preview: string;
  } | null>(
    property?.mainImage ? { file: null, preview: property.mainImage } : null
  );

  const [roomTypeImages, setRoomTypeImages] = useState<RoomTypeImagePreview[]>(
    []
  );
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const roomTypeImagesInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = mode === "view";
  const title =
    mode === "create"
      ? "Add New Property"
      : mode === "edit"
      ? "Edit Property"
      : "Property Details";

  // Initialize room images for edit mode
  useEffect(() => {
    if (property?.roomTypeImages && mode === "edit") {
      const existingRoomTypeImages = property.roomTypeImages.map((img) => ({
        file: new File([], "existing"),
        preview: img.url,
        roomType: img.roomType,
        description: img.description || "",
        isExisting: true,
        originalUrl: img.url,
      }));
      setRoomTypeImages(existingRoomTypeImages);
    }
  }, [property, mode]);

  useEffect(() => {
    return () => {
      // Clean up preview URLs
      roomTypeImages.forEach((img) => {
        if (img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
      if (mainImage?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(mainImage.preview);
      }
    };
  }, [mainImage, roomTypeImages]);

  const mainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (mainImage?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(mainImage.preview);
      }
      const preview = URL.createObjectURL(file);
      setMainImage({ file, preview });
    }
  };

  const roomTypeImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newRoomTypeImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      roomType: "other",
      description: "",
      isExisting: false,
    }));
    setRoomTypeImages((prev) => [...prev, ...newRoomTypeImages]);
  };

  const updateRoomTypeImage = (
    index: number,
    field: "roomType" | "description",
    value: string
  ) => {
    setRoomTypeImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    );
  };

  const removeRoomTypeImage = (index: number) => {
    setRoomTypeImages((prev) => {
      const imageToRemove = prev[index];

      if (imageToRemove.isExisting && imageToRemove.originalUrl) {
        setImagesToRemove((current) => [
          ...current,
          imageToRemove.originalUrl!,
        ]);
      }

      if (imageToRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const removeMainImage = () => {
    if (mainImage?.preview.startsWith("blob:")) {
      URL.revokeObjectURL(mainImage.preview);
    }
    setMainImage(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || loading) return;

    try {
      setLoading(true);

      if (!formData.title || !formData.location || !formData.description) {
        alert("Please fill in all required fields.");
        return;
      }

      if (mode === "create" && !mainImage?.file) {
        alert("Please upload a main image.");
        return;
      }

      if (
        formData.type === "house" &&
        (!formData.bedrooms || !formData.bathrooms)
      ) {
        alert("Bedrooms and bathrooms are required for house type.");
        return;
      }

      //Prepare room image uploads (only new files)
      const roomTypeImageUploads: RoomTypeImageUpload[] = roomTypeImages
        .filter((img) => !img.isExisting && img.file.name !== "existing")
        .map((img) => ({
          file: img.file,
          roomType: img.roomType as RoomTypeImageUpload["roomType"],
          description: img.description,
        }));

      const submissionData: CreatePropertyFormData = {
        ...formData,
        roomTypeImageUploads,
        removeRoomTypeImages: imagesToRemove,
        mainImageFile: mainImage?.file as File,
      };

      if (mainImage?.file) {
        submissionData.mainImageFile = mainImage.file;
      }

      await onSubmit(submissionData);
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Failed to save property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
                required
                readOnly={isReadOnly}
                disabled={loading}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
                required
                readOnly={isReadOnly}
                disabled={loading}
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
                      e.target.value === "plot" ? 0 : prev.bedrooms || 1,
                    bathrooms:
                      e.target.value === "plot" ? 0 : prev.bathrooms || 1,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
                disabled={isReadOnly || loading}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
                disabled={isReadOnly || loading}
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
                className=" w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
                required
                readOnly={isReadOnly}
                disabled={loading}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
                required
                readOnly={isReadOnly}
                disabled={loading}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
                    min="1"
                    required
                    readOnly={isReadOnly}
                    disabled={loading}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
                    min="1"
                    required
                    readOnly={isReadOnly}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-light-blue rounded focus:ring-blue-500"
                  disabled={isReadOnly || loading}
                />
                <label
                  htmlFor="featured"
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer"
                >
                  <Star className="w-4 h-4" />
                  Featured Property
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Featured properties appear on the homepage and get priority
                visibility
              </p>
            </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
              required
              readOnly={isReadOnly}
              disabled={loading}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Features & Amenities
            </label>

            {!isReadOnly && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 text-black focus:border-blue-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  disabled={loading || !newFeature.trim()}
                  className="px-4 py-2 bg-light-blue text-white rounded-lg hover:bg-blue-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span className="text-gray-700">{feature}</span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {formData.features.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No features added yet
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Main Property Image *
            </label>

            {mainImage && (
              <div className="mb-4">
                <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
                  <Image
                    src={mainImage.preview}
                    alt="Main property image"
                    fill
                    className="object-cover"
                  />
                  {!isReadOnly && !loading && (
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute top-2 right-2 p-1 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isReadOnly && (
              <div className="mb-4">
                <input
                  ref={mainImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={mainImageUpload}
                  className="hidden"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => mainImageInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-800 text-white rounded-lg hover:shadow-lg transition-colors cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  {mainImage ? "Change Main Image" : "Upload Main Image"}
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  This will be the primary image displayed for your property
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Room Images
            </label>

            {!isReadOnly && (
              <div className="mb-4">
                <input
                  ref={roomTypeImagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={roomTypeImagesUpload}
                  className="hidden"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => roomTypeImagesInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg hover:shadow-lg transition-colors cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4" />
                  Add Room Images
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  Upload images of different rooms or areas
                </p>
              </div>
            )}

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {roomTypeImages.map((roomImage, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={roomImage.preview}
                        alt="Room image"
                        fill
                        className="object-cover"
                      />
                      {!isReadOnly && !loading && (
                        <button
                          type="button"
                          onClick={() => removeRoomTypeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 text-gray-700">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Room Type
                        </label>
                        <select
                          value={roomImage.roomType}
                          onChange={(e) =>
                            updateRoomTypeImage(
                              index,
                              "roomType",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none"
                          disabled={isReadOnly || loading}
                        >
                          {ROOM_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={roomImage.description}
                          onChange={(e) =>
                            updateRoomTypeImage(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Describe this room..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none"
                          readOnly={isReadOnly}
                          disabled={loading}
                          maxLength={200}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {roomTypeImages.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No room images added yet
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isReadOnly ? "Close" : "Cancel"}
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-light-blue to-blue-800 text-white rounded-lg hover:shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {mode === "create" ? "Create Property" : "Update Property"}
              </button>
            )}
          </div>
        </form>
      </div>
      <style jsx>
        {`input::-webkit-outer-spin-button,
                   input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;`}
      </style>
    </div>
  );
};

export default PropertyModal;
