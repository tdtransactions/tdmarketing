import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_for_build");
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const body = await req.json();
    console.log("🔔 Gửi email thông báo:", body);
    const { to, storeName, customerName, customerPhone, googleWebsiteLink, salesPerson, package: pkg } = body;

    if (!to || !storeName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#111827;">Website Đã Hoàn Thành ✅</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                Xin chào <strong>${salesPerson || "Sales"}</strong>, dự án website cho tiệm dưới đây đã được xử lý hoàn thành và sẵn sàng để bàn giao:
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
✅ THÔNG BÁO HOÀN THÀNH WEBSITE

Xin chào ${salesPerson || "Sales"},

Website cho tiệm "${storeName}" đã được xử lý hoàn thành.

THÔNG TIN CHI TIẾT:
- Tiệm: ${storeName}
- Khách hàng: ${customerName || "—"}
- Số điện thoại: ${customerPhone || "—"}
- Gói dịch vụ: ${pkg || "PRO"}
- Website: ${googleWebsiteLink || "—"}

Vui lòng kiểm tra và bàn giao cho khách hàng.
Hệ thống quản lý TD Marketing.
`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      replyTo: "support@tdtransactionsllc.com",
      subject: `✅ [TD Marketing] Website hoàn thành: ${storeName}`,
      text,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error("API notify error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
