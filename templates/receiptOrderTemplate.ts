/**
 * CherryBrush Email Service & Template Generator
 * Follows CherryBrush Scandinavian Birch & Rose Palette:
 * - Birch Cream background: #F5EFE0 / #FAF8F5
 * - Walnut Deep text: #3D2B1F
 * - Muted Walnut: #8A7060
 * - Rose / Cherry Accent: #C25D65 / #A0604A
 * - Confirmed Status: #E8F5E9 / #2E7D32
 * - Pure White Cards: #FFFFFF
 */

export interface OrderItem {
  name: string;
  price: string;
}

export interface EmailTemplateData {
  customerName?: string;
  clientName?: string;
  addressLine1?: string;
  addressLine2?: string;
  invoiceNumber?: string;
  orderDate?: string;
  dueDate?: string;
  status?: string;
  items?: OrderItem[];
  totalAmount?: string;
}

export function generateOrderConfirmationHtml(
  data: EmailTemplateData = {},
): string {
  const customerName = data.customerName || "";
  const clientName = data.clientName || "CherryBrush";
  const addressLine1 = data.addressLine1 || "";
  const addressLine2 = data.addressLine2 || "";
  const invoiceNumber = data.invoiceNumber || "";
  const orderDate = data.orderDate || "";
  const dueDate = data.dueDate || "";
  const status = data.status || "Confirmed";
  const totalAmount = data.totalAmount || "";

  const items = data.items || [];

  const itemsHtml =
    items.length > 0
      ? items
          .map(
            (item) => `
        <tr>
          <td style="padding: 10px 0; font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #3D2B1F;">
            ${item.name || ""}
          </td>
          <td align="right" style="padding: 10px 0; font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500; color: #3D2B1F;">
            ${item.price || ""}
          </td>
        </tr>`,
          )
          .join("")
      : `<tr>
          <td colspan="2" style="padding: 10px 0; font-family: 'Josefin Sans', sans-serif; font-size: 13px; color: #8A7060;">
            No items listed.
          </td>
        </tr>`;

  const addressBlock = [addressLine1, addressLine2].filter(Boolean).join("<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${clientName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400;1,600&family=Josefin+Sans:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* Responsive overrides */
    @media only screen and (max-width: 620px) {
      .container-table {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content-padding {
        padding: 24px 16px !important;
      }
      .column-half {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .column-half-right {
        margin-top: 16px !important;
      }
      .footer-col {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
        margin-bottom: 20px !important;
      }
      .footer-col-right {
        text-align: left !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #EFE8DD; font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #3D2B1F;">

  <!-- Outer Canvas Table -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #EFE8DD; min-height: 100vh; padding: 40px 10px;">
    <tr>
      <td align="center" valign="top">
        
        <!-- Main Email Card (Max 600px) -->
        <table role="presentation" class="container-table" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FAF6EE; border-radius: 28px; overflow: hidden; box-shadow: 0 16px 40px rgba(61, 43, 31, 0.08); border: 1px solid rgba(107, 79, 58, 0.1);">
          
          <!-- Header & Content Area -->
          <tr>
            <td class="content-padding" style="padding: 40px 36px 32px 36px;">
              
              <!-- Brand Logo & Name -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td>
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px;">
                          <!-- CherryBrush Logo -->
                          <img src="cid:cherrybrush_logo" alt="${clientName}" width="38" height="38" style="display: block; border-radius: 10px; width: 38px; height: 38px; object-fit: cover; box-shadow: 0 2px 8px rgba(194, 93, 101, 0.25);" />
                        </td>
                        <td valign="middle">
                          <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: 0.06em; color: #3D2B1F; display: inline-block; vertical-align: middle;">
                            ${clientName}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Main Heading: Thank you for your order! -->
              <h1 style="margin: 0 0 20px 0; font-family: 'Outfit', 'Josefin Sans', sans-serif; font-size: 27px; line-height: 1.25; font-weight: 800; color: #3D2B1F; letter-spacing: -0.01em;">
                Thank you for your order!
              </h1>

              <!-- Greeting & Subtext -->
              ${customerName ? `
              <p style="margin: 0 0 10px 0; font-family: 'Josefin Sans', sans-serif; font-size: 15px; font-weight: 700; color: #3D2B1F;">
                Hi ${customerName},
              </p>` : ""}
              <p style="margin: 0 0 28px 0; font-family: 'Josefin Sans', sans-serif; font-size: 12.5px; line-height: 1.55; color: #8A7060; max-width: 480px;">
                Thanks for your order! We have received your order details and our team is preparing it with care.
              </p>

              <!-- CARD 1: Order Details -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 20px; border: 1px solid rgba(107, 79, 58, 0.09); margin-bottom: 22px;">
                <tr>
                  <td style="padding: 26px 28px;">
                    <h2 style="margin: 0 0 20px 0; font-family: 'Outfit', 'Josefin Sans', sans-serif; font-size: 19px; font-weight: 700; color: #3D2B1F;">
                      Order Details
                    </h2>

                    <!-- 2-Column Info Grid -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left Column: Recipient & Address -->
                        <td class="column-half" width="55%" valign="top" style="padding-right: 12px;">
                          <div style="font-family: 'Josefin Sans', sans-serif; font-size: 13px; font-weight: 700; color: #3D2B1F; margin-bottom: 4px;">
                            Delivery Address
                          </div>
                          ${customerName ? `
                          <div style="font-family: 'Josefin Sans', sans-serif; font-size: 13px; font-weight: 600; color: #3D2B1F; margin-bottom: 4px;">
                            ${customerName}
                          </div>` : ""}
                          ${addressBlock ? `
                          <div style="font-family: 'Josefin Sans', sans-serif; font-size: 11.5px; line-height: 1.45; color: #8A7060;">
                            ${addressBlock}
                          </div>` : ""}
                        </td>

                        <!-- Right Column: Invoice, Dates, Status -->
                        <td class="column-half column-half-right" width="45%" valign="top" align="right">
                          <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-left: auto;">
                            ${invoiceNumber ? `
                            <tr>
                              <td style="padding: 3px 0; font-family: 'Josefin Sans', sans-serif; font-size: 12px; font-weight: 600; color: #3D2B1F; text-align: right;">
                                Invoice:
                              </td>
                              <td style="padding: 3px 0 3px 12px; font-family: 'Josefin Sans', sans-serif; font-size: 12px; font-weight: 500; color: #8A7060; text-align: right;">
                                ${invoiceNumber}
                              </td>
                            </tr>` : ""}
                            ${orderDate ? `
                            <tr>
                              <td style="padding: 3px 0; font-family: 'Josefin Sans', sans-serif; font-size: 12px; font-weight: 600; color: #3D2B1F; text-align: right;">
                                Date:
                              </td>
                              <td style="padding: 3px 0 3px 12px; font-family: 'Josefin Sans', sans-serif; font-size: 12px; font-weight: 500; color: #8A7060; text-align: right;">
                                ${orderDate}
                              </td>
                            </tr>` : ""}
                            ${dueDate ? `
                            <tr>
                              <td style="padding: 3px 0; font-family: 'Josefin Sans', sans-serif; font-size: 12px; font-weight: 600; color: #3D2B1F; text-align: right;">
                                Due Date:
                              </td>
                              <td style="padding: 3px 0 3px 12px; font-family: 'Josefin Sans', sans-serif; font-size: 12px; font-weight: 500; color: #8A7060; text-align: right;">
                                ${dueDate}
                              </td>
                            </tr>` : ""}
                            ${status ? `
                            <tr>
                              <td style="padding: 6px 0 0 0; font-family: 'Josefin Sans', sans-serif; font-size: 12px; font-weight: 600; color: #3D2B1F; text-align: right;">
                                Status:
                              </td>
                              <td style="padding: 6px 0 0 12px; text-align: right;">
                                <span style="display: inline-block; background-color: #C1E8C9; color: #1E6B35; font-family: 'Josefin Sans', sans-serif; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; letter-spacing: 0.02em;">
                                  ${status}
                                </span>
                              </td>
                            </tr>` : ""}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CARD 2: Order Summary -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 20px; border: 1px solid rgba(107, 79, 58, 0.09); margin-bottom: 22px;">
                <tr>
                  <td style="padding: 26px 28px;">
                    <h2 style="margin: 0 0 16px 0; font-family: 'Outfit', 'Josefin Sans', sans-serif; font-size: 19px; font-weight: 700; color: #3D2B1F;">
                      Order Summary
                    </h2>

                    <!-- Items Table -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${itemsHtml}
                      
                      <!-- Divider -->
                      <tr>
                        <td colspan="2" style="padding: 12px 0 14px 0;">
                          <div style="height: 1px; background-color: rgba(107, 79, 58, 0.14); width: 100%;"></div>
                        </td>
                      </tr>

                      <!-- Total Row -->
                      ${totalAmount ? `
                      <tr>
                        <td style="font-family: 'Outfit', 'Josefin Sans', sans-serif; font-size: 16px; font-weight: 800; color: #3D2B1F;">
                          Total amount
                        </td>
                        <td align="right" style="font-family: 'Outfit', 'Josefin Sans', sans-serif; font-size: 18px; font-weight: 800; color: #3D2B1F;">
                          ${totalAmount}
                        </td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CARD 3: Are you satisfied from our service? -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 20px; border: 1px solid rgba(107, 79, 58, 0.09); margin-bottom: 22px;">
                <tr>
                  <td align="center" style="padding: 34px 28px;">
                    <h3 style="margin: 0 0 16px 0; font-family: 'Outfit', 'Josefin Sans', sans-serif; font-size: 18px; font-weight: 700; color: #3D2B1F; letter-spacing: -0.01em;">
                      Are you satisfied from our service?
                    </h3>

                    <!-- 5 Golden Rating Stars -->
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td style="padding: 0 4px; font-size: 28px; line-height: 1; color: #F5A623;">&#9734;</td>
                        <td style="padding: 0 4px; font-size: 28px; line-height: 1; color: #F5A623;">&#9734;</td>
                        <td style="padding: 0 4px; font-size: 28px; line-height: 1; color: #F5A623;">&#9734;</td>
                        <td style="padding: 0 4px; font-size: 28px; line-height: 1; color: #F5A623;">&#9734;</td>
                        <td style="padding: 0 4px; font-size: 28px; line-height: 1; color: #F5A623;">&#9734;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CARD 4: Up to 50% Off Promo Banner -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-radius: 22px; overflow: hidden; margin-bottom: 28px; background: #1C1917; background-image: linear-gradient(135deg, rgba(28,25,23,0.95) 0%, rgba(61,43,31,0.85) 50%, rgba(194,93,101,0.7) 100%);">
                <tr>
                  <td style="padding: 36px 30px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left text & CTAs -->
                        <td width="60%" valign="middle">
                          <div style="font-family: 'Outfit', 'Josefin Sans', sans-serif; font-size: 22px; font-weight: 800; color: #FFFFFF; line-height: 1.2;">
                            Up to 50%
                          </div>
                          <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26px; font-style: italic; font-weight: 700; color: #78C98B; line-height: 1.2; margin-top: 2px;">
                            Off <span style="font-style: italic; color: #A4E2B2;">Mega sale</span>
                          </div>
                          <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-style: italic; font-weight: 600; color: #E8D9C0; line-height: 1.3; margin-bottom: 22px;">
                            best offer
                          </div>

                          <!-- Button 1: Explore more -->
                          <div style="margin-bottom: 10px;">
                            <a href="https://cherrybrush.in/collection" target="_blank" style="display: block; width: 140px; text-align: center; background-color: rgba(255, 255, 255, 0.16); color: #FFFFFF; font-family: 'Josefin Sans', sans-serif; font-size: 13px; font-weight: 600; padding: 10px 16px; border-radius: 8px; text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.22); box-sizing: border-box;">
                              Explore more
                            </a>
                          </div>

                          <!-- Button 2: Grab the offer -->
                          <div>
                            <a href="https://cherrybrush.in" target="_blank" style="display: block; width: 140px; text-align: center; background-color: #FFFFFF; color: #1C1917; font-family: 'Josefin Sans', sans-serif; font-size: 13px; font-weight: 700; padding: 10px 16px; border-radius: 8px; text-decoration: none; box-sizing: border-box; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
                              Grab the offer
                            </a>
                          </div>
                        </td>

                        <!-- Right image: Stylish visual -->
                        <td width="40%" valign="middle" align="right" style="padding-left: 10px;">
                          <img src="cid:promo_banner_img" alt="Special Offer" width="160" style="display: block; width: 100%; max-width: 170px; border-radius: 14px; object-fit: cover;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- FOOTER SECTION: Brand Logo, Socials -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 20px; border: 1px solid rgba(107, 79, 58, 0.09);">
                <tr>
                  <td style="padding: 28px 28px 24px 28px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left Column: Logo & Socials -->
                        <td class="footer-col" width="50%" valign="top">
                          <!-- Brand Header in Footer -->
                          <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                            <tr>
                              <td valign="middle" style="padding-right: 10px;">
                                <img src="cid:cherrybrush_logo" alt="${clientName}" width="30" height="30" style="display: block; border-radius: 8px; width: 30px; height: 30px; object-fit: cover;" />
                              </td>
                              <td valign="middle">
                                <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 21px; font-weight: 700; color: #3D2B1F;">
                                  ${clientName}
                                </span>
                              </td>
                            </tr>
                          </table>

                          <!-- Social Media Icons (FB, IG, X, TikTok, YouTube) -->
                          <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <!-- Facebook -->
                              <td style="padding-right: 8px;">
                                <a href="https://facebook.com" target="_blank" style="text-decoration: none;">
                                  <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #1C1917; text-align: center; line-height: 26px;">
                                    <span style="color: #FFFFFF; font-family: sans-serif; font-size: 13px; font-weight: bold;">f</span>
                                  </div>
                                </a>
                              </td>
                              <!-- Instagram -->
                              <td style="padding-right: 8px;">
                                <a href="https://instagram.com" target="_blank" style="text-decoration: none;">
                                  <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #1C1917; text-align: center; line-height: 26px;">
                                    <span style="color: #FFFFFF; font-family: sans-serif; font-size: 11px;">&#9678;</span>
                                  </div>
                                </a>
                              </td>
                              <!-- X (Twitter) -->
                              <td style="padding-right: 8px;">
                                <a href="https://x.com" target="_blank" style="text-decoration: none;">
                                  <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #1C1917; text-align: center; line-height: 26px;">
                                    <span style="color: #FFFFFF; font-family: sans-serif; font-size: 11px; font-weight: bold;">&#120143;</span>
                                  </div>
                                </a>
                              </td>
                              <!-- TikTok -->
                              <td style="padding-right: 8px;">
                                <a href="https://tiktok.com" target="_blank" style="text-decoration: none;">
                                  <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #1C1917; text-align: center; line-height: 26px;">
                                    <span style="color: #FFFFFF; font-family: sans-serif; font-size: 11px;">&#9835;</span>
                                  </div>
                                </a>
                              </td>
                              <!-- YouTube -->
                              <td>
                                <a href="https://youtube.com" target="_blank" style="text-decoration: none;">
                                  <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #1C1917; text-align: center; line-height: 26px;">
                                    <span style="color: #FFFFFF; font-family: sans-serif; font-size: 10px;">&#9658;</span>
                                  </div>
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>                        
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>`;
}
