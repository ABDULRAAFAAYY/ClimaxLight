import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

/**
 * Send an Order Slip email to the store owner
 * @param {Object} order - The created order document
 */
export const sendOrderSlipEmail = async (order) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const recipientEmail = process.env.ORDER_NOTIFICATION_EMAIL || emailUser || 'climaxlights54@gmail.com';

    // If credentials are not configured, log helpful message and return gracefully
    if (!emailUser || !emailPass) {
        console.log(`ℹ️ [EmailService] Email notification skipped for order ${order.orderNumber}. Set EMAIL_USER and EMAIL_PASS in backend/.env to receive order slips.`);
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        // Format items table rows
        const itemsRows = order.items.map(item => `
            <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px; font-weight: bold; color: #1a1a2e;">
                    ${item.itemCode}
                    ${item.selectedSize ? `<br><span style="font-size: 12px; color: #ff5722; font-weight: normal;">Size: ${item.selectedSize}</span>` : ''}
                </td>
                <td style="padding: 10px; text-align: center; color: #555555;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; color: #555555;">Rs. ${item.price.toLocaleString()}</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #1a1a2e;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('');

        const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('en-PK', {
            dateStyle: 'full',
            timeStyle: 'short'
        });

        const paymentBadge = order.paymentMethod === 'Online'
            ? `<span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">📱 Online Bank Transfer (${order.paymentStatus})</span>`
            : `<span style="background: #fff3e0; color: #e65100; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">💵 Cash on Delivery (Pending)</span>`;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>New Order Slip - ${order.orderNumber}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                
                <!-- Header -->
                <div style="background-color: #1a1a2e; color: #ffffff; padding: 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; color: #d4af37; letter-spacing: 1px;">CLIMAX LIGHTS</h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #e0e0e0;">✨ New Customer Order Received ✨</p>
                </div>

                <!-- Order Meta -->
                <div style="padding: 20px 24px; background-color: #fafafa; border-bottom: 1px solid #eeeeee;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td>
                                <strong style="font-size: 18px; color: #1a1a2e;">Order: ${order.orderNumber}</strong><br>
                                <span style="font-size: 13px; color: #777777;">${orderDate}</span>
                            </td>
                            <td style="text-align: right;">
                                ${paymentBadge}
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Customer Details -->
                <div style="padding: 20px 24px; border-bottom: 1px solid #eeeeee;">
                    <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 16px; color: #1a1a2e; border-bottom: 2px solid #ff5722; display: inline-block; padding-bottom: 4px;">👤 Customer Details</h3>
                    <table style="width: 100%; font-size: 14px; line-height: 1.6; color: #333333;">
                        <tr>
                            <td style="width: 100px; color: #777777;">Name:</td>
                            <td style="font-weight: bold;">${order.customer.name}</td>
                        </tr>
                        <tr>
                            <td style="color: #777777;">Phone:</td>
                            <td><a href="tel:${order.customer.phone}" style="color: #ff5722; font-weight: bold; text-decoration: none;">📞 ${order.customer.phone}</a></td>
                        </tr>
                        <tr>
                            <td style="color: #777777;">City:</td>
                            <td style="font-weight: bold;">${order.customer.city}</td>
                        </tr>
                        <tr>
                            <td style="color: #777777;">Address:</td>
                            <td>${order.customer.address}</td>
                        </tr>
                    </table>
                </div>

                <!-- Items Table -->
                <div style="padding: 20px 24px;">
                    <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 16px; color: #1a1a2e; border-bottom: 2px solid #ff5722; display: inline-block; padding-bottom: 4px;">📦 Ordered Items</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="background-color: #f9f9f9; text-align: left; border-bottom: 2px solid #e0e0e0;">
                                <th style="padding: 10px; color: #555555;">Item Code</th>
                                <th style="padding: 10px; text-align: center; color: #555555;">Qty</th>
                                <th style="padding: 10px; text-align: right; color: #555555;">Price</th>
                                <th style="padding: 10px; text-align: right; color: #555555;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="padding: 16px 10px; text-align: right; font-size: 16px; font-weight: bold; color: #1a1a2e;">Grand Total:</td>
                                <td style="padding: 16px 10px; text-align: right; font-size: 18px; font-weight: bold; color: #ff5722;">Rs. ${order.totalAmount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Footer -->
                <div style="background-color: #f9f9f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0;">This is an automated notification from your Climax Lights store.</p>
                    <p style="margin: 4px 0 0 0;">View and manage this order in the <a href="http://localhost:3000/admin" style="color: #ff5722; text-decoration: none; font-weight: bold;">Admin Panel</a>.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Check if bank transfer receipt image exists and attach it
        const attachments = [];
        if (order.receiptImage) {
            const cleanPath = order.receiptImage.replace(/^\//, '');
            const absoluteReceiptPath = path.join(__dirname, '..', cleanPath);
            if (fs.existsSync(absoluteReceiptPath)) {
                attachments.push({
                    filename: `receipt-${order.orderNumber}${path.extname(absoluteReceiptPath)}`,
                    path: absoluteReceiptPath
                });
            }
        }

        const mailOptions = {
            from: `"Climax Lights" <${emailUser}>`,
            to: recipientEmail,
            subject: `🔔 New Order Slip: ${order.orderNumber} - Rs. ${order.totalAmount.toLocaleString()} (${order.customer.name})`,
            html: htmlContent,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [EmailService] Order slip sent successfully for ${order.orderNumber}. Message ID: ${info.messageId}`);
    } catch (err) {
        console.error(`❌ [EmailService] Failed to send order slip email for ${order.orderNumber}:`, err.message);
    }
};
