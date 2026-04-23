import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_for_build");
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const body = await req.json();
    console.log("🔔 Gửi email thông báo:", body);
    let { to, storeName, customerName, customerPhone, googleWebsiteLink, salesPerson, package: pkg, type, assignedTo } = body;

    // Validate and normalize 'to' field
    if (!to) {
      return NextResponse.json({ error: "Missing recipient (to)" }, { status: 400 });
    }

    const recipients = Array.isArray(to) ? to.filter(email => typeof email === "string" && email.trim() !== "") : [to];
    
    if (recipients.length === 0) {
      return NextResponse.json({ error: "No valid recipients provided" }, { status: 400 });
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = recipients.filter(email => emailRegex.test(email));

    if (validRecipients.length === 0) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!storeName) {
      return NextResponse.json({ error: "Missing storeName" }, { status: 400 });
    }

    const isProcessing = type === "processing";
    const statusIcon = isProcessing ? "⟳" : "✅";
    const statusText = isProcessing ? "Đang Xử Lý" : "Đã Hoàn Thành";
    const statusDescription = isProcessing 
      ? `Dự án website cho tiệm dưới đây đã được <strong>${Array.isArray(assignedTo) ? assignedTo.join(", ") : (assignedTo || "đội ngũ kỹ thuật")}</strong> tiếp nhận và đang triển khai xử lý:`
      : `Dự án website cho tiệm dưới đây đã được xử lý hoàn thành và sẵn sàng để bàn giao:`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:40px 20px;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:40px;">
          
          <!-- Logo/Brand -->
          <tr>
            <td style="padding-bottom:30px;border-bottom:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:2px;">TD Marketing System</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:30px 0;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#111827;">Website ${statusText} ${statusIcon}</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Xin chào <strong>${salesPerson || "Sales"}</strong>, ${statusDescription}
              </p>
            </td>
          </tr>

          <!-- Data Table -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;padding:24px;">
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">Tên Tiệm</p>
                    <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#111827;">${storeName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">Khách Hàng</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#334155;">${customerName || "—"} · ${customerPhone || "—"}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">Gói Dịch Vụ</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#334155;font-weight:600;">${pkg || "PRO"}</p>
                  </td>
                </tr>
                ${googleWebsiteLink ? `
                <tr>
                  <td style="padding-top:8px;border-top:1px solid #e2e8f0;margin-top:16px;">
                    <p style="margin:16px 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">Đường Dẫn Website</p>
                    <a href="${googleWebsiteLink.startsWith('http') ? googleWebsiteLink : 'https://' + googleWebsiteLink}" style="font-size:15px;font-weight:700;color:#6366f1;text-decoration:none;">${googleWebsiteLink}</a>
                  </td>
                </tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Đây là thông báo tự động từ hệ thống quản lý giao dịch TD Transactions.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `
✅ THÔNG BÁO ${statusText.toUpperCase()} WEBSITE

Xin chào ${salesPerson || "Sales"},

Website cho tiệm "${storeName}" ${statusText.toLowerCase()}.

THÔNG TIN CHI TIẾT:
- Tiệm: ${storeName}
- Khách hàng: ${customerName || "—"}
- Số điện thoại: ${customerPhone || "—"}
- Gói dịch vụ: ${pkg || "PRO"}
- Website: ${googleWebsiteLink || "—"}
${isProcessing ? `- Nhân sự phụ trách: ${Array.isArray(assignedTo) ? assignedTo.join(", ") : (assignedTo || "—")}\n` : ""}

Vui lòng kiểm tra và xử lý.
Hệ thống quản lý TD Marketing.
`;

    const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@mytdtransactions.com";

    const sendPromises = validRecipients.map(async (recipient) => {
      const isAdmin = recipient.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      const personalizedStatusDescription = isProcessing 
        ? (isAdmin 
            ? `Hệ thống thông báo: Dự án website cho tiệm dưới đây đã được <strong>${Array.isArray(assignedTo) ? assignedTo.join(", ") : (assignedTo || "đội ngũ kỹ thuật")}</strong> tiếp nhận và bắt đầu xử lý.`
            : `Xin chào <strong>${salesPerson || "Sales"}</strong>, dự án website cho tiệm dưới đây đã được <strong>${Array.isArray(assignedTo) ? assignedTo.join(", ") : (assignedTo || "đội ngũ kỹ thuật")}</strong> tiếp nhận và đang triển khai xử lý:`)
        : (isAdmin
            ? `Hệ thống thông báo: Dự án website cho tiệm dưới đây đã được xử lý hoàn thành và sẵn sàng bàn giao.`
            : `Xin chào <strong>${salesPerson || "Sales"}</strong>, dự án website cho tiệm dưới đây đã được xử lý hoàn thành và sẵn sàng để bàn giao:`);

      const personalizedHtml = html.replace(statusDescription, personalizedStatusDescription)
                                   .replace(`Xin chào <strong>${salesPerson || "Sales"}</strong>`, isAdmin ? `Thông báo cho <strong>Admin</strong>` : `Xin chào <strong>${salesPerson || "Sales"}</strong>`);
      
      const personalizedText = text.replace(`Xin chào ${salesPerson || "Sales"}`, isAdmin ? `Thông báo cho Admin` : `Xin chào ${salesPerson || "Sales"}`);

      try {
        const res = await resend.emails.send({
          from: FROM_EMAIL,
          to: [recipient],
          replyTo: "support@tdtransactionsllc.com",
          subject: `${isAdmin ? "[ADMIN] " : ""}${statusIcon} [TD Marketing] Website ${statusText.toLowerCase()}: ${storeName}`,
          text: personalizedText,
          html: personalizedHtml,
        });
        return { recipient, ...res };
      } catch (e: any) {
        return { recipient, data: null, error: { message: e.message } };
      }
    });

    const results = await Promise.all(sendPromises);
    const failures = results.filter(r => r.error);

    if (failures.length > 0) {
      console.error("❌ Resend notification failures:", JSON.stringify(failures, null, 2));
      return NextResponse.json({ 
        error: "Failed to send one or more emails", 
        details: failures.map(f => ({ email: f.recipient, error: f.error?.message })) 
      }, { status: 500 });
    }

    console.log("✅ Thông báo gửi thành công:", results.map(r => r.recipient));
    return NextResponse.json({ success: true, ids: results.map(r => r.data?.id) });
  } catch (err: any) {
    console.error("API notify error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
