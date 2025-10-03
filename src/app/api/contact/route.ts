import {
  ContactNotificationData,
  EmailService,
} from "@/lib/services/email.service";
import { NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const POST = async (request: NextRequest) => {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();

    const contactData: ContactNotificationData = {
      userName: body.name,
      userEmail: body.email,
      userPhone: body.phone,
      subject: body.subject || "General Inquiry",
      message: body.message,
      submissionDate: new Date().toISOString(),
    };

    await emailService.sendContactNotification(contactData);

    return NextResponse.json(
      { message: "Contact form submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
