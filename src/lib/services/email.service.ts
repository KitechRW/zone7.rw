import logger from "../utils/logger";

export interface InterestNotificationData {
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: string;
  propertyCategory: "rent" | "sale";
  userName: string;
  userEmail: string;
  userPhone: string;
  message?: string;
  interestDate: string;
}

export interface PasswordResetData {
  userEmail: string;
  userName: string;
  resetLink: string;
}

export interface ContactNotificationData {
  userName: string;
  userEmail: string;
  userPhone: string;
  subject: string;
  message: string;
  submissionDate: string;
}

export interface BrokerCredentialsData {
  userEmail: string;
  userName: string;
  password: string;
  loginUrl: string;
}

export class EmailService {
  private static instance: EmailService;
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private brokerEmail: string;

  private constructor() {
    this.apiKey = process.env.BREVO_API_KEY!;
    this.fromEmail = process.env.BREVO_FROM_EMAIL!;
    this.fromName = process.env.BREVO_FROM_NAME!;
    this.brokerEmail = process.env.ADMIN_EMAIL!;

    if (!this.apiKey) {
      throw new Error("BREVO_API_KEY environment variable is required");
    }

    if (!this.fromEmail) {
      throw new Error("BREVO_FROM_EMAIL environment variable is required");
    }

    if (!this.brokerEmail) {
      throw new Error("ADMIN_EMAIL environment variable is required");
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async sendEmail(emailData: {
    to: Array<{ email: string; name?: string }>;
    subject: string;
    htmlContent: string;
    textContent?: string;
  }): Promise<void> {
    const brevoPayload = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: emailData.to,
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Brevo API error: ${response.status}`
      );
    }
  }

  //BROKER CREATION EMAIL
  async sendBrokerCredentials(data: BrokerCredentialsData): Promise<void> {
    try {
      await this.sendEmail({
        to: [
          {
            email: data.userEmail,
            name: data.userName,
          },
        ],
        subject: "Broker Account Created - Login Credentials",
        htmlContent: this.generateBrokerCredentialsTemplate(data),
        textContent: this.generateBrokerCredentialsText(data),
      });

      logger.info("Broker credentials email sent successfully", {
        userEmail: data.userEmail,
      });
    } catch (error) {
      logger.error("Failed to send broker credentials email", {
        error: error instanceof Error ? error.message : "Unknown error",
        data: { ...data, password: "[REDACTED]" },
      });
      throw error;
    }
  }

  private generateBrokerCredentialsTemplate(
    data: BrokerCredentialsData
  ): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Broker Account Created</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
          }
          .container {
              background-color: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
          }
          .header h1 {
              color: #1f2937;
              margin: 0;
              font-size: 28px;
          }
          .content {
              margin: 20px 0;
          }
          .greeting {
              font-size: 16px;
              margin-bottom: 20px;
              color: #374151;
          }
          .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4b5563;
              margin-bottom: 30px;
          }
          .credentials-box {
              background-color: #fcfeff;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 5px 10px;
              margin: 20px 0;
          }
          .credential-item {
              margin: 10px 0;
              padding: 4px;
              background-color: #fcfcfc;
              border-radius: 4px;
          }
          .credential-label {
              font-weight: 700;
              color: #5c5c5c;
              font-size: 18px;
          }
          .credential-value {
              color: #1f2937;
              font-size: 16px;
              word-break: break-all;
              margin-top: 5px;
          }
          .login-button {
              text-align: center;
              margin: 30px 0;
          }
          .login-button a {
              display: inline-block;
              background-color: #3399ff;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 4px;
              font-size: 16px;
              font-weight: 700;
              transition: background-color 0.3s;
          }
          .login-button a:hover {
              background-color: #2563eb;
          }
          .security-info {
              background-color: #fafafa;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
          }
          .security-info p {
              color: #5c5c5c;
              margin: 5px 0;
              font-size: 14px;
          }
          .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
          }
          .footer p {
              margin: 5px 0;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Welcome to the Brokers Team!</h1>
          </div>

          <div class="content">
              <div class="greeting">
                  Hello ${data.userName},
              </div>

              <div class="message">
                  Your Broker account has been created successfully for ${
                    process.env.NEXT_PUBLIC_COMPANY_NAME
                  }. 
                  <br/>Below are your login credentials to access the broker dashboard.
              </div>

              <div class="credentials-box">
                  <div class="credential-item">
                      <div class="credential-label">Email:</div>
                      <div class="credential-value">${data.userEmail}</div>
                  </div>
                  <div class="credential-item">
                      <div class="credential-label">Temporary Password:</div>
                      <div class="credential-value">${data.password}</div>
                  </div>
              </div>

              <div class="login-button">
                  <a href="${data.loginUrl}">Access Broker Dashboard</a>
              </div>

              <div class="security-info">
                  <p><strong>Important Security Notes:</strong></p>
                  <p>• Keep your credentials secure and never share them</p>
                  <p>• You can reset your password anytime using the "Forgot Password" option</p>
                  <p>• This email contains sensitive information - please delete it after saving your credentials securely</p>
              </div>
          </div>

          <div class="footer">
              <p>If you have any questions or need assistance, please contact our support team.</p>
              <p style="margin-top: 20px; font-size: 12px;">
                  © ${new Date().getFullYear()} ${
      process.env.NEXT_PUBLIC_COMPANY_NAME
    }. All rights reserved.
              </p>
          </div>
      </div>
  </body>
  </html>
  `;
  }

  private generateBrokerCredentialsText(data: BrokerCredentialsData): string {
    return `
BROKER ACCOUNT CREATED

Hello ${data.userName},

Your Broker account has been created successfully for ${process.env.NEXT_PUBLIC_COMPANY_NAME}.

LOGIN CREDENTIALS:
Email: ${data.userEmail}
Temporary Password: ${data.password}

Login URL: ${data.loginUrl}

IMPORTANT SECURITY NOTES:
- Please change your password after your first login
- Keep your credentials secure and never share them
- You can reset your password anytime using the "Forgot Password" option
- This email contains sensitive information - please delete it after saving your credentials securely

If you have any questions or need assistance, please contact our support team.

---
${process.env.NEXT_PUBLIC_COMPANY_NAME}
Broker System
  `.trim();
  }

  // INTEREST PLACEMENT EMAIL
  async sendInterestNotification(
    data: InterestNotificationData
  ): Promise<void> {
    try {
      await this.sendEmail({
        to: [
          {
            email: this.brokerEmail,
            name: "Property Broker",
          },
        ],
        subject: `New Interest: ${data.propertyTitle}`,
        htmlContent: this.generateInterestEmailTemplate(data),
        textContent: this.generateInterestEmailText(data),
      });

      logger.info("Interest notification email sent successfully", {
        propertyTitle: data.propertyTitle,
        userEmail: data.userEmail,
      });
    } catch (error) {
      logger.error("Failed to send interest notification email", {
        error: error instanceof Error ? error.message : "Unknown error",
        data,
      });

      // Don't throw error
      console.error("Email notification failed:", error);
    }
  }

  private generateInterestEmailTemplate(
    data: InterestNotificationData
  ): string {
    const categoryText = data.propertyCategory === "rent" ? "Rent" : "Sale";
    const actionText = data.propertyCategory === "rent" ? "rent" : "purchase";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Property Interest</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                justify: center;
            }
            .header {
                margin-bottom: 30px;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #1f2937;
                margin: 0;
                font-size: 32px;
            }
            .property-info {
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .property-title {
                font-size: 20px;
                font-weight: bold;
                color: #1f2937;
                margin: 0 0 10px 0;
            }
            .property-details {
                color: #6b7280;
                margin: 5px 0;
            }
            .price {
                font-size: 20px;
                font-weight: bold;
                color: ${
                  data.propertyCategory === "rent" ? "#059669" : "#2563eb"
                };
                margin: 10px 0;
            }
            .user-info {
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .user-detail {
                margin: 8px 0;
                display: flex;
                align-items: center;
                
            }
            .label {
                font-weight: bold;
                color: #374151;
                width: 80px;
                display: inline-block;
            }
            .value {
                color: #1f2937;
            }
            .message-section {
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .message-text {
                font-style: italic;
                font-size: 18px;
                color: #374151;
                line-height: 1.5;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .contact-links {
                margin: 15px 0;
            }
            .contact-link {
                display: inline-block;
                margin: 0 10px;
                padding: 8px 16px;
                background-color: #267dd4;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-size: 14px;
            }
            
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Property Interest!</h1>
                <p>Someone is interested in one of your properties</p>
            </div>

            <div class="property-info">
                <div class="property-title">${data.propertyTitle}</div>
                <div class="property-details">${data.propertyLocation}</div>
                <div class="price"> ${data.propertyPrice} ${
      data.propertyCategory === "rent" ? "/month" : ""
    }</div>
                <div class="property-details">
                    <span style="background-color: ${
                      data.propertyCategory === "rent" ? "#059669" : "#2563eb"
                    }; 
                          color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                        For ${categoryText}
                    </span>
                </div>
            </div>

            <div class="user-info">
                <h3 style="margin-top: 0; color: #92400e; font-size: 20px;">Interested Person Details</h3>
                <div class="user-detail">
                    <span class="label">Name:</span>
                    <span class="value">${data.userName}</span>
                </div>
                <div class="user-detail">
                    <span class="label">Email:</span>
                    <span class="value">
                        <a href="mailto:${data.userEmail}">${
      data.userEmail
    }</a></span>
                </div>
                <div class="user-detail">
                    <span class="label">Phone:</span>
                    <span class="value"><a href="tel:${data.userPhone}">${
      data.userPhone
    }</a></span>
                </div>
                <div class="user-detail">
                    <span class="label">Date:</span>
                    <span class="value">${new Date(
                      data.interestDate
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</span>
                </div>
            </div>

            ${
              data.message
                ? `
            <div class="message-section">
                <h3 style="margin-top: 0; color: #065f46; font-size: 20px;">Message from ${data.userName}</h3>
                <div class="message-text">"${data.message}"</div>
            </div>
            `
                : ""
            }

            <div class="footer">
                <p><strong>Action Required:</strong> Please contact ${
                  data.userName
                } to discuss their interest in this property.</p>
                <p>This notification was sent automatically when someone expressed interest to ${actionText} your property.</p>
                <p style="margin-top: 20px; font-size: 12px;">
                    © ${new Date().getFullYear()} ${
      process.env.NEXT_PUBLIC_COMPANY_NAME
    }. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateInterestEmailText(data: InterestNotificationData): string {
    const categoryText = data.propertyCategory === "rent" ? "rent" : "sale";

    return `
NEW PROPERTY INTEREST NOTIFICATION

Property: ${data.propertyTitle}
Location: ${data.propertyLocation}
Price: ${data.propertyPrice}${data.propertyCategory === "rent" ? "/month" : ""}
Type: For ${categoryText}

Interested Person:
Name: ${data.userName}
Email: ${data.userEmail}
Phone: ${data.userPhone}
Date: ${new Date(data.interestDate).toLocaleDateString()}

${data.message ? `Message: "${data.message}"` : ""}

Please contact ${data.userName} at ${data.userEmail} or ${
      data.userPhone
    } to discuss their interest.

---
${process.env.NEXT_PUBLIC_COMPANY_NAME}
Automated notification system
    `.trim();
  }

  //PASSWORD RESET EMAIL
  async sendPasswordReset(data: PasswordResetData): Promise<void> {
    try {
      await this.sendEmail({
        to: [
          {
            email: data.userEmail,
            name: data.userName,
          },
        ],
        subject: "Password Reset Request",
        htmlContent: this.generatePasswordResetTemplate(data),
        textContent: this.generatePasswordResetText(data),
      });

      logger.info("Password reset email sent successfully", {
        userEmail: data.userEmail,
      });
    } catch (error) {
      logger.error("Failed to send password reset email", {
        error: error instanceof Error ? error.message : "Unknown error",
        data,
      });
      throw error;
    }
  }

  private generatePasswordResetTemplate(data: PasswordResetData): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
          }
          .container {
              background-color: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
          }
          .header h1 {
              color: #1f2937;
              margin: 0;
              font-size: 28px;
          }
          .content {
              margin: 20px 0;
          }
          .greeting {
              font-size: 16px;
              margin-bottom: 20px;
              color: #374151;
          }
          .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4b5563;
              margin-bottom: 30px;
          }
          .reset-button {
              text-align: center;
              margin: 30px 0;
          }
          .reset-button a {
              display: inline-block;
              background-color: #3399ff;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 4px;
              font-size: 16px;
              font-weight: 700;
              transition: background-color 0.3s;
          }
          .reset-button a:hover {
              background-color: #3b82f6;
          }
          .security-info p {
              color:  #32325d;
              margin: 20px 0;
              font-size: 14px;
              line-height: 1.5;
          }
          .alternative-link {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              word-break: break-all;
              font-size: 12px;
              color: #6b7280;
          }
          .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
          }
          .footer p {
              margin: 5px 0;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Password Reset</h1>
          </div>

          <div class="content">
              <div class="greeting">
                  Hello ${data.userName},
              </div>

              <div class="message">
                  You recently requested to reset your password for your ${
                    process.env.NEXT_PUBLIC_COMPANY_NAME
                  } account. 
                  Click the button below to reset your password.
              </div>

              <div class="reset-button">
                  <a href="${data.resetLink}">Reset My Password</a>
              </div>

              <div class="security-info">
                  <p>This link will expire in 15 minutes for your security<br>
                  </p>
              </div>

              <div class="alternative-link">
                  <strong>Button not working?</strong><br>
                  Copy and paste this link into your browser:<br>
                  ${data.resetLink}
              </div>
          </div>

          <div class="footer">
              <p><strong>Didn't request this?</strong></p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p style="margin-top: 20px; font-size: 12px;">
                  © ${new Date().getFullYear()} ${
      process.env.NEXT_PUBLIC_COMPANY_NAME
    }. All rights reserved.
              </p>
          </div>
      </div>
  </body>
  </html>
  `;
  }

  private generatePasswordResetText(data: PasswordResetData): string {
    return `
PASSWORD RESET REQUEST

Hello ${data.userName},

You recently requested to reset your password for your ${process.env.NEXT_PUBLIC_COMPANY_NAME} account.

To reset your password, click on the following link:
${data.resetLink}

IMPORTANT SECURITY INFORMATION:
- This link will expire in 15 minutes
- If you didn't request this reset, you can safely ignore this email
- Your password will not be changed until you create a new one
- For security, you'll be logged out of all devices after resetting

If the link doesn't work, copy and paste it into your browser address bar.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

---
${process.env.NEXT_PUBLIC_COMPANY_NAME}
Automated security system
  `.trim();
  }

  async sendContactNotification(data: ContactNotificationData): Promise<void> {
    try {
      await this.sendEmail({
        to: [
          {
            email: this.brokerEmail,
            name: "Contact Form Broker",
          },
        ],
        subject: `Contact Form: ${data.subject}`,
        htmlContent: this.generateContactEmailTemplate(data),
        textContent: this.generateContactEmailText(data),
      });

      logger.info("Contact form email sent successfully", {
        subject: data.subject,
        userEmail: data.userEmail,
      });
    } catch (error) {
      logger.error("Failed to send contact form email", {
        error: error instanceof Error ? error.message : "Unknown error",
        data,
      });

      // Re-throw error for contact forms (unlike interest notifications)
      throw error;
    }
  }

  private generateContactEmailTemplate(data: ContactNotificationData): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
          }
          .container {
              background-color: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              margin-bottom: 30px;
              padding-bottom: 20px;
          }
          .header h1 {
              color: #1f2937;
              margin: 0;
              font-size: 28px;
          }
          .subject-badge {
              background-color: #fff;
              color: #3399ff;
              padding: 5px 10px;
              border-radius: 15px;
              font-size: 20px;
              display: inline-block;
              margin-top: 5px;
              text-transform: capitalize;
          }
          .contact-info {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
          }
          .contact-detail {
              margin: 8px 0;
              display: flex;
              align-items: center;
          }
          .label {
              font-weight: bold;
              color: #374151;
              width: 100px;
              display: inline-block;
          }
          .value {
              color: #1f2937;
          }
          .message-section {
              background-color: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
          }
          .message-text {
              font-size: 16px;
              color: #374151;
              line-height: 1.6;
              white-space: pre-wrap;
          }
          .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
          }
          .action-buttons {
              text-align: center;
              margin: 25px 0;
          }
          .action-button {
              display: inline-block;
              margin: 0 8px;
              padding: 10px 20px;
              border: 2px solid #2c5282;
              color: #2c5282;
              text-decoration: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>New Contact Notice</h1>
              <div class="subject-badge">${data.subject}</div>
          </div>

          <div class="contact-info">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Contact Details</h3>
              <div class="contact-detail">
                  <span class="label">Name:</span>
                  <span class="value">${data.userName}</span>
              </div>
              <div class="contact-detail">
                  <span class="label">Email:</span>
                  <span class="value">
                      <a href="mailto:${
                        data.userEmail
                      }" style="color: #3b82f6; text-decoration: none;">
                          ${data.userEmail}
                      </a>
                  </span>
              </div>
              <div class="contact-detail">
                  <span class="label">Phone:</span>
                  <span class="value">
                      <a href="tel:${
                        data.userPhone
                      }" style="color: #3b82f6; text-decoration: none;">
                          ${data.userPhone}
                      </a>
                  </span>
              </div>
              <div class="contact-detail">
                  <span class="label">Date:</span>
                  <span class="value">${new Date(
                    data.submissionDate
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</span>
              </div>
          </div>

          <div class="message-section">
              <h3 style="margin-top: 0; color: #0369a1; font-size: 18px;">Message</h3>
              <div class="message-text">${data.message}</div>
          </div>

          <div class="action-buttons">
              <a href="mailto:${data.userEmail}?subject=Re: ${
      data.subject
    }" class="action-button">
                  Reply via Email
              </a>
              <a href="tel:${data.userPhone}" class="action-button">
                  Call Now
              </a>
          </div>

          <div class="footer">
              <p><strong>Action Required:</strong> Please respond to ${
                data.userName
              } within 24 hours.</p>
              <p>This email was automatically generated from your website's contact form.</p>
              <p style="margin-top: 20px; font-size: 12px;">
                  © ${new Date().getFullYear()} ${
      process.env.NEXT_PUBLIC_COMPANY_NAME
    }. All rights reserved.
              </p>
          </div>
      </div>
  </body>
  </html>
  `;
  }

  private generateContactEmailText(data: ContactNotificationData): string {
    return `
NEW CONTACT FORM SUBMISSION

Subject: ${data.subject}

Contact Details:
Name: ${data.userName}
Email: ${data.userEmail}
Phone: ${data.userPhone}
Date: ${new Date(data.submissionDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}

Message:
${data.message}

Action Required: Please respond to ${data.userName} within 24 hours.

Quick Actions:
- Reply: ${data.userEmail}
- Call: ${data.userPhone}

---
${process.env.NEXT_PUBLIC_COMPANY_NAME}
Website Contact Form
  `.trim();
  }
}
