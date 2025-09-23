"use client";

import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Header from "@/components/layout/Header2";
import Link from "next/link";
import Loader from "@/components/misc/Loader";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  submit?: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, SetIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      SetIsLoading(false);
    }, 1000);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors((prev) => ({
          ...prev,
          submit: data.error || "Failed to send message",
        }));
        return;
      }

      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
      setErrors({});
    } catch (error) {
      console.error("Error sending message:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to send message. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return isLoading ? (
    <Loader className="h-screen" />
  ) : (
    <div className="min-h-screen bg-platinum">
      <Header />
      <div className="bg-white border-b border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto xs:px-10 lg:px-5 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Talk To Us!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get in touch with our real estate team today.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto xs:px-10 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-sm shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Send us a Message
              </h2>

              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
                  <p className="text-red-800 text-base font-medium">
                    An error occurred. Please try again later.
                  </p>
                </div>
              )}

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm">
                  <p className="text-green-800">
                    Thank you! Your message has been sent successfully.
                    We&#39;ll get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 -mt-1.5 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-sm focus:outline-none focus:border-gray-400 text-gray-700 -mt-1.5 transition-colors ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 -mt-1.5 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-sm focus:outline-none focus:border-gray-400 text-gray-700 -mt-1.5 transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 -mt-1.5 mb-2"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-sm focus:outline-none focus:border-gray-400 text-gray-700 -mt-1.5 transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 -mt-1.5 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-gray-400 text-gray-700 -mt-1.5 transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="buying">Buying Property</option>
                      <option value="selling">Selling Property</option>
                      <option value="renting">Renting</option>
                      <option value="consultation">Consultation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 -mt-1.5 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-sm focus:outline-none focus:border-gray-400 text-gray-700 -mt-1.5 transition-colors resize-vertical ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us about your real estate needs..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-4 py-3 bg-gradient-to-r from-light-blue to-blue-800 text-white font-medium rounded-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Get In Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 -mt-1.5">Phone</h3>
                    <Link href="tel:+250788123456">
                      <p className="text-gray-600 hover:text-gray-900">
                        +250788123456
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 -mt-1.5">Email</h3>
                    <Link href="mailto:info@realestate.com">
                      <p className="text-gray-600 hover:text-gray-900">
                        info@realestate.com
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 -mt-1.5">
                      Address
                    </h3>
                    <p className="text-gray-600">
                      Giporoso KG Ave 123
                      <br />
                      Nice Plaza
                      <br />
                      Kigali
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 -mt-1.5">
                      Office Hours
                    </h3>
                    <div className="text-gray-600">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
